import { Controller, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '../../files', filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    // Set the 'Content-Disposition' header to 'attachment' to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file
    res.sendFile(filePath);
  }
}
