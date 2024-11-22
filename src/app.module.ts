import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CohereController } from './cohere/cohere.controller';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { GeminiService } from './gemini/gemini.service'; // Import GeminiService
import { GeminiController } from './gemini/gemini.controller'; // Import GeminiController
import { CohereService } from './cohere/cohere.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    UsersModule,
    ProjectsModule,
    AuthModule,
    HttpModule, // Add HttpModule here
  ],
  controllers: [AppController, CohereController, GeminiController], // Add GeminiController
  providers: [AppService, CohereService, GeminiService], // Add GeminiService
})
export class AppModule {}
