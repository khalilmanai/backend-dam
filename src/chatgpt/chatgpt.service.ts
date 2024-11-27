import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph } from 'docx';
import * as mammoth from 'mammoth';

@Injectable()
export class ChatGptService {
  private readonly apiUrl = process.env.CHATGPT_API_URL || 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey = process.env.CHATGPT_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  // Helper function to interact with the OpenAI API
  private async getChatGptResponse(prompt: string): Promise<string> {
    console.log('Sending prompt to ChatGPT:', prompt);

    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl,
        {
          model: 'gpt-4', // You can switch the model based on your needs
          messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
          max_tokens: 3000, // Adjust this value if you want a longer response
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )
    );

    console.log('Received response from ChatGPT:', response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  }

  // Generate structured Cahier de Charge content dynamically
  async generateCahierDeChargeContent(projectData: any): Promise<string> {
    const prompt = `
Create a detailed "Cahier de Charge" for a project with the following information:
- Project Name: ${projectData.projectName}
- Project Description: ${projectData.projectDescription}
- Budget: ${projectData.budget}
- Deadline: ${projectData.deadline}
- Methodology: ${projectData.methodology}

The document should be at least **1500 words** long and contain the following structured sections:
1. **Table of Contents**:
   - Provide a clear and detailed list of sections with subsections.
   
2. **Project Presentation**:
   - Context and problem statement: Include 2-3 paragraphs explaining the project's background and objectives.

3. **Analysis of the Existing Situation**:
   - Describe the current state, challenges, and gaps with 2-3 detailed paragraphs.

4. **Proposed Solution**:
   - Present a solution in 3-4 paragraphs, covering how the project will address the challenges.

5. **Functional and Non-Functional Requirements**:
   - List 6-8 requirements with a brief explanation for each.

6. **Technology Stack**:
   - Explain the rationale for choosing specific tools, frameworks, or languages in 2-3 paragraphs.

7. **Application Overview**:
   - Describe design choices, such as the logo, key interfaces, and their usability in 3-4 paragraphs.

8. **Conclusion**:
   - Summarize the benefits and goals of the project in 2-3 paragraphs.

Ensure that each section is detailed, professional, and coherent. Expand as much as possible while remaining relevant to the project details.
`;


    const generatedContent = await this.getChatGptResponse(prompt);
    return generatedContent;
  }

  // Create a Word document from the generated content
  async createWordDocument(content: string): Promise<string> {
    const filesDirectory = path.join(__dirname, '../../files');
    if (!fs.existsSync(filesDirectory)) {
      fs.mkdirSync(filesDirectory, { recursive: true });
    }

    const wordPath = path.join(filesDirectory, `Cahier_de_Charge_${Date.now()}.docx`);
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: content.split('\n').map((line) => new Paragraph(line)),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(wordPath, buffer);

    console.log('Word document created at:', wordPath);
    return wordPath;
  }

  // Parse the uploaded Word document content
  async parseWordDocument(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      console.log('Parsed Word document content:', result.value);
      return result.value; // The extracted text content
    } catch (error) {
      console.error('Error parsing Word document:', error.message || error);
      throw new Error('Failed to parse Word document');
    }
  }

  // Generate tasks based on the parsed content
  async generateTasksFromContent(content: string): Promise<any> {
    const prompt = `
      Based on the following "Cahier de Charge" content, generate a list of tasks for the project team members:
      ${content}

      The tasks should be allocated based on their competences, which are mentioned in the "Cahier de Charge". 
      Provide the tasks in a structured way, with each task assigned to a specific team member.
    `;
    
    const tasksContent = await this.getChatGptResponse(prompt);
    console.log('Generated tasks:', tasksContent);
    return tasksContent;
  }
}
