import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const cors = require('cors');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Project Management Backend')
    .setDescription(
      'This is backend server for the Project Management application dedicated to Manage Professional IT projects with the Help of High End Artificial intelligence solutions.',
    )
    .addBearerAuth()
    .setVersion('1.1.0')
    .build();
  app.use(bodyParser.json({ limit: '100mb' })); // Set the limit to 10MB
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); // Adjust the size as needed

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(process.env.port);

  app.use(cors());
  app.enableCors();
}
bootstrap();
