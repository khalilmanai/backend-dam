// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationModule } from './invitation/invitation.module';
import { ChatGptService } from './chatgpt/chatgpt.service';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import * as path from 'path';
import { ChatGptController } from './chatgpt/chatgpt.controller';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    UsersModule,
    ProjectsModule,
    AuthModule,
    InvitationModule,
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'files'), // Path to your files directory
      serveRoot: '/files',  // URL prefix for serving files
    }),
    TasksModule, // Ensure TasksModule is imported
    EventsModule,
  ],
  controllers: [AppController, ChatGptController, WebhookController],
  providers: [AppService, ChatGptService, WebhookService],
})
export class AppModule {}
