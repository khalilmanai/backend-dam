import { Controller, Post, Body, Req, Res, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatGptService } from './chatgpt.service';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('chatgpt')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post('generate-cahier-de-charge')
  async generateCahierDeCharge(
    @Body() projectData: { projectName: string, projectDescription: string, budget: string, deadline: string, teamMembers: Array<{ name: string; competence: string }>, methodology: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Generate content from project data
    const content = await this.chatGptService.generateCahierDeChargeContent(projectData);
  
    // Create Word document
    const wordFilePath = await this.chatGptService.createWordDocument(content);
  
    // Generate file URL dynamically
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const wordFileUrl = `${baseUrl}/files/${path.basename(wordFilePath)}`;
  
    // Return URL to the frontend
    res.status(HttpStatus.OK).json({ message: 'Cahier de Charge generated successfully', file: wordFileUrl });
  }
  


  @Post('upload-updated-cahier')
@UseInterceptors(FileInterceptor('file'))
async uploadUpdatedCahier(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: Request,
  @Res() res: Response,
) {
  const filePath = path.join(__dirname, '../../uploads', file.originalname);
  fs.writeFileSync(filePath, file.buffer);

  // Parse the uploaded Word document
  const content = await this.chatGptService.parseWordDocument(filePath);

  // Generate tasks from parsed content
  const tasks = await this.chatGptService.generateTasksFromContent(content);

  // Return tasks to frontend
  res.status(HttpStatus.OK).json({ message: 'File processed successfully', tasks });
}

@Post('generate-tasks')
async generateTasks(@Body() content: string, @Res() res: Response) {
  // Generate tasks from the Cahier de Charge content
  const tasks = await this.chatGptService.generateTasksFromContent(content);

  // Send tasks back to frontend
  res.status(HttpStatus.OK).json({ message: 'Tasks generated successfully', tasks });
}


}
