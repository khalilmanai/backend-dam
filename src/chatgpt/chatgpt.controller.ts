// controllers/chatgpt.controller.ts

import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  Param, 
  Res, 
  HttpException, 
  HttpStatus, 
  UploadedFile, 
  UseInterceptors 
} from '@nestjs/common';
import { Response } from 'express';
import { ChatGptService } from './chatgpt.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chatgpt')
export class ChatGptController {
  private readonly logger = new Logger(ChatGptController.name);

  constructor(private readonly chatGptService: ChatGptService) {}

  // Endpoint to generate Cahier de Charge content and save the file
  @Post('generate-cahier-de-charge')
  async generateCahierDeCharge(
    @Body() projectData: {
      projectName: string;
      projectDescription: string;
      budget: string;
      deadline: string;
      teamMembers: Array<{ name: string; competence: string }>;
      methodology: string;
    },
    @Res() res: Response
  ) {
    try {
      // Validate input data
      if (
        !projectData ||
        !projectData.projectName ||
        !projectData.projectDescription ||
        !projectData.budget ||
        !projectData.deadline ||
        !projectData.methodology
      ) {
        this.logger.warn('Missing required project data');
        throw new HttpException('Missing required project data', HttpStatus.BAD_REQUEST);
      }

      // Log the incoming project data
      this.logger.log('Received project data:');
      this.logger.log(JSON.stringify(projectData));

      // Generate the content using the service
      const content = await this.chatGptService.generateCahierDeChargeContent(projectData);

      // Log the generated content
      this.logger.log('Generated Cahier de Charge content:');
      this.logger.log(content);

      // Save the document on the server and return the file path
      const { fileUrl, filename } = await this.chatGptService.generateAndSaveDocx(projectData, content);

      // Return the file URL (accessible through a public URL) and the content for preview
      res.status(HttpStatus.OK).json({
        message: 'Cahier de Charge generated successfully',
        content: content,  // Return content for preview
        fileUrl: fileUrl,  // Return the file URL for download
      });
    } catch (error) {
      this.logger.error('Error in generateCahierDeCharge:', error.message || error);
      throw new HttpException('Failed to generate Cahier de Charge', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to serve the file via a public URL
  @Get('download/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      if (!filename) {
        this.logger.warn('No filename provided for download');
        throw new HttpException('Filename is required', HttpStatus.BAD_REQUEST);
      }

      // Use the service's uploads directory to construct the file path
      const filePath = path.join(this.chatGptService['uploadsDir'], filename); // Accessing private property via bracket notation

      // Ensure the file exists
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File not found: ${filePath}`);
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      // Log the download attempt
      this.logger.log(`Serving file: ${filePath}`);

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); // Corrected here

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (err) => {
        this.logger.error('Error streaming file:', err.message);
        throw new HttpException('Error streaming file', HttpStatus.INTERNAL_SERVER_ERROR);
      });

      fileStream.pipe(res);
    } catch (error) {
      this.logger.error('Error in serveFile:', error.message || error);
      throw new HttpException('Failed to download file', error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to upload the updated Cahier de Charge
  @Post('upload-cahier-de-charge')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCahierDeCharge(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    try {
      if (!file) {
        this.logger.warn('No file uploaded');
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Log the uploaded file info
      this.logger.log('Received uploaded file:');
      this.logger.log(file.originalname);

      // Save the file to the uploads directory
      const { uploadsDir } = this.chatGptService;
      const filePath = path.join(uploadsDir, file.originalname);
      await fs.promises.writeFile(filePath, file.buffer);
      this.logger.log(`Saved uploaded file to ${filePath}`);

      // Return the file URL for preview
      const fileUrl = `http://localhost:3000/chatgpt/download/${file.originalname}`; // Adjust the URL as needed for your environment

      res.status(HttpStatus.OK).json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl,
        filename: file.originalname,
      });
    } catch (error) {
      this.logger.error('Error in uploadCahierDeCharge:', error.message || error);
      throw new HttpException('Failed to upload Cahier de Charge', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to parse uploaded Cahier de Charge DOCX File by Filename
  @Post('parse-cahier-de-charge')
  async parseCahierDeCharge(
    @Body('filename') filename: string,
    @Res() res: Response
  ) {
    try {
      if (!filename) {
        this.logger.warn('No filename provided for parsing');
        throw new HttpException('No filename provided', HttpStatus.BAD_REQUEST);
      }

      // Log the filename to be parsed
      this.logger.log(`Parsing file: ${filename}`);

      // Parse the file using ChatGptService
      const parsedData = await this.chatGptService.parseExistingDocx(filename);

      // Return the parsed data
      res.status(HttpStatus.OK).json({
        message: 'File parsed successfully',
        data: parsedData,
      });
    } catch (error) {
      this.logger.error('Error in parseCahierDeCharge:', error.message || error);
      throw new HttpException('Failed to parse Cahier de Charge', error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // **New Endpoint to Generate Tasks**
  @Post('generate-tasks')
  async generateTasks(
    @Body() body: {
      teamMembers: Array<{ name: string; competence: string }>;
      cahierDeChargeContent: string;
    },
    @Res() res: Response
  ) {
    try {
      const { teamMembers, cahierDeChargeContent } = body;

      // Validate input
      if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
        this.logger.warn('Invalid or missing team members.');
        throw new HttpException('Invalid or missing team members.', HttpStatus.BAD_REQUEST);
      }

      if (!cahierDeChargeContent || typeof cahierDeChargeContent !== 'string' || cahierDeChargeContent.trim() === '') {
        this.logger.warn('Invalid or missing Cahier de Charge content.');
        throw new HttpException('Invalid or missing Cahier de Charge content.', HttpStatus.BAD_REQUEST);
      }

      // Log the incoming data
      this.logger.log(`Generating tasks for team members: ${JSON.stringify(teamMembers)}`);

      // Generate tasks using the service
      const tasks = await this.chatGptService.generateTasks(teamMembers, cahierDeChargeContent);

      // Log the generated tasks
      this.logger.log(`Generated tasks: ${JSON.stringify(tasks)}`);

      // Return the tasks
      res.status(HttpStatus.OK).json({
        message: 'Tasks generated successfully',
        tasks: tasks,
      });
    } catch (error) {
      this.logger.error('Error in generateTasks:', error.message || error);
      // Determine if the error is an instance of HttpException to maintain the status code
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Failed to generate tasks', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
