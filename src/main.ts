// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable JSON parsing for incoming webhook payloads
  app.use(bodyParser.json());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Project Management Backend')
    .setDescription(
      'This is the backend server for the Project Management application dedicated to managing professional IT projects with the help of high-end Artificial Intelligence solutions.'
    )
    .addBearerAuth()
    .setVersion('1.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  // Enable CORS for API access from different origins
  app.enableCors();

  // Serve the uploads directory statically
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/', // Files can be accessed via http://your-server/uploads/filename.pdf
  });

  // Start listening on the specified port
  const port = process.env.PORT || 3000; // Default to 3000 if `process.env.PORT` is not defined
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
