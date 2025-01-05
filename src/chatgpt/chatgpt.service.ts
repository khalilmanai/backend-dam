// services/chatgpt.service.ts

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as docx from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth'; // Import Mammoth for parsing DOCX files

@Injectable()
export class ChatGptService {
  private readonly apiUrl = process.env.CHATGPT_API_URL || 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(ChatGptService.name);

  // Define the absolute path to the uploads directory
  readonly uploadsDir = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly httpService: HttpService) {
    this.ensureUploadsDir();
    // Optional: Log the API key for debugging (Remove in production)
    // this.logger.log(`Using OpenAI API Key: ${this.apiKey}`);
  }

  // Ensure the uploads directory exists
  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory at ${this.uploadsDir}`);
    }
  }

  // Method to interact with ChatGPT API
  private async getChatGptResponse(prompt: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            model: 'gpt-3.5-turbo', // Consistent model usage
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1500, // Increased to accommodate larger responses
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: null,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          }
        )
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error('Error communicating with ChatGPT API:', error.message || error);
      throw new Error('Error communicating with ChatGPT API: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  // Function to generate the Cahier de Charge content
  async generateCahierDeChargeContent(projectData: any): Promise<string> {
    const prompt = `Create a detailed "Cahier de Charge" for a project with the following information:
- Project Name: ${projectData.projectName}
- Project Description: ${projectData.projectDescription}
- Budget: ${projectData.budget}
- Deadline: ${projectData.deadline}
- Methodology: ${projectData.methodology}

The document should include sections such as Project Presentation, Analysis, Proposed Solution, Requirements, Technology Stack, Application Overview, and Conclusion.`;

    // Send the prompt to ChatGPT and get the generated content
    const generatedContent = await this.getChatGptResponse(prompt);
    return generatedContent;
  }

  // Function to generate and save the Docx file
  async generateAndSaveDocx(projectData: any, content: string): Promise<{ fileUrl: string; filename: string }> {
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              children: [
                new docx.TextRun(`Project Name: ${projectData.projectName}`),
                new docx.TextRun(`\nProject Description: ${projectData.projectDescription}`),
                new docx.TextRun(`\nBudget: ${projectData.budget}`),
                new docx.TextRun(`\nDeadline: ${projectData.deadline}`),
                new docx.TextRun(`\nMethodology: ${projectData.methodology}`),
                new docx.TextRun(`\n\nGenerated Content:`),
                new docx.TextRun(`\n\n${content}`),
              ],
            }),
          ],
        },
      ],
    });

    try {
      // Generate the buffer for the .docx file
      const buffer = await docx.Packer.toBuffer(doc);

      const filename = `CahierDeCharge_${Date.now()}.docx`;
      const filePath = path.join(this.uploadsDir, filename);

      // Save the file to disk
      await fs.promises.writeFile(filePath, buffer);
      this.logger.log(`Saved Cahier de Charge to ${filePath}`);

      // Return the public URL and filename
      const fileUrl = `http://localhost:3000/chatgpt/download/${filename}`; // Adjust the URL as needed for your environment
      return { fileUrl, filename };
    } catch (error) {
      this.logger.error('Error generating and saving DOCX file:', error.message || error);
      throw new HttpException('Failed to generate and save DOCX file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Function to parse an existing DOCX file by filename
  async parseExistingDocx(filename: string): Promise<any> {
    try {
      const filePath = path.join(this.uploadsDir, filename);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File not found: ${filePath}`);
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Parsing file at path: ${filePath}`);

      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value; // The raw text extracted from the DOCX

      // Optionally, implement further parsing logic to structure the data
      // For example, extracting specific sections or data points
      this.logger.log(`Parsed text: ${text.substring(0, 100)}...`); // Log first 100 characters for debugging

      return { text };
    } catch (error) {
      this.logger.error('Error parsing DOCX file:', error.message || error);
      throw new HttpException('Error parsing DOCX file: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates tasks based on team members and Cahier de Charge content.
   * @param {Array<{ name: string; competence: string }>} teamMembers - Array of team member objects with name and competence.
   * @param {string} cahierDeChargeContent - The content of the Cahier de Charge.
   * @returns {Object} - JSON object with team member names as keys and their tasks as values.
   */
  async generateTasks(teamMembers: Array<{ name: string; competence: string }>, cahierDeChargeContent: string): Promise<Record<string, any[]>> {
    try {
      // Construct the prompt for ChatGPT
      let prompt = `Based on the following Cahier de Charge content, generate a list of tasks for each team member so every member have its tasks no 2 members for the same task please based on their competence. The tasks should include a title, description, deadline, budget, and status (set to "To Do" by default). The status should be one of "To Do", "In Progress", or "Done". The response should be in JSON format where each key is the team member's name and the value is an array of their tasks.
    
Cahier de Charge Content:
${cahierDeChargeContent}

Team Members:
`;

      teamMembers.forEach((member) => {
        prompt += `- Name: ${member.name}, Competence: ${member.competence}\n`;
      });

      prompt += `

Example Response Format:
{
  "Alice": [
    {
      "title": "Design Landing Page",
      "description": "Create the UI/UX design for the landing page.",
      "deadline": "2024-05-10",
      "budget": "500",
      "status": "To Do"
    }
  ],
  "Bob": [
    {
      "title": "Implement Real-Time Chat",
      "description": "Develop the backend and frontend for the real-time chat feature.",
      "deadline": "2024-06-10",
      "budget": "1200",
      "status": "To Do"
    }
  ]
}`;

      // Get response from ChatGPT
      const generatedText = await this.getChatGptResponse(prompt);

      // Attempt to parse the generated text as JSON
      let tasks: Record<string, any[]>;
      try {
        tasks = JSON.parse(generatedText);
      } catch (error) {
        // If JSON parsing fails, attempt to extract JSON from the text
        const jsonStart = generatedText.indexOf('{');
        const jsonEnd = generatedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = generatedText.substring(jsonStart, jsonEnd + 1);
          tasks = JSON.parse(jsonString);
        } else {
          this.logger.error('Failed to parse tasks JSON.');
          throw new HttpException('Failed to parse tasks JSON.', HttpStatus.BAD_REQUEST);
        }
      }

      // Validate that the number of keys matches the number of team members
      if (Object.keys(tasks).length !== teamMembers.length) {
        this.logger.warn('Number of task categories does not match number of team members.');
        throw new HttpException('Mismatch between number of team members and generated task categories.', HttpStatus.BAD_REQUEST);
      }

      // Validate the structure of each task
      for (const member of teamMembers) {
        if (!tasks[member.name]) {
          this.logger.warn(`No tasks generated for team member: ${member.name}`);
          throw new HttpException(`No tasks generated for team member: ${member.name}`, HttpStatus.BAD_REQUEST);
        }

        tasks[member.name].forEach((task, index) => {
          if (!task.title || !task.description || !task.deadline || !task.budget) {
            this.logger.warn(`Incomplete task data for ${member.name} at index ${index}`);
            throw new HttpException(`Incomplete task data for ${member.name} at index ${index}`, HttpStatus.BAD_REQUEST);
          }

          // Ensure status is set to "To Do" if not provided
          if (!task.status) {
            tasks[member.name][index].status = "To Do";
          } else {
            // Validate that the status is one of the allowed values
            const allowedStatuses = ["To Do", "In Progress", "Done"];
            if (!allowedStatuses.includes(task.status)) {
              this.logger.warn(`Invalid status value for ${member.name} at index ${index}: ${task.status}`);
              throw new HttpException(`Invalid status value for ${member.name} at index ${index}: ${task.status}`, HttpStatus.BAD_REQUEST);
            }
          }
        });
      }

      return tasks;
    } catch (error) {
      this.logger.error('Error generating tasks:', error.message || error);
      throw new HttpException('Failed to generate tasks.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
