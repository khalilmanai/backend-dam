import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationModule } from './invitation/invitation.module';
import { ChatGptController } from './chatgpt/chatgpt.controller';
import { ChatGptService } from './chatgpt/chatgpt.service';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

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
  ],
  controllers: [AppController, ChatGptController],
  providers: [AppService, ChatGptService],
})
export class AppModule {}
