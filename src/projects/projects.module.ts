// src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from './projects.controller';
import { ProjectService } from './projects.service';
import { Project, ProjectSchema } from './entities/project.schema';
import { User, UserSchema } from 'src/users/entities/user.schema';
import { UserService } from 'src/users/users.service';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema }, // Import User schema for ProjectService
    ]),
    TasksModule, // Import TasksModule to access TaskService and Task model
  ],
  controllers: [ProjectController],
  providers: [ProjectService, UserService], // Provide UserService if ProjectService depends on it
  exports: [ProjectService], // Export ProjectService if used in other modules
})
export class ProjectsModule {}
