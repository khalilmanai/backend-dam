// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';

import { User, UserSchema } from 'src/users/entities/user.schema';
import { Project, ProjectSchema } from 'src/projects/entities/project.schema';
import { Task, TaskSchema } from './entities/task.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema }, // Import Project schema if needed
      { name: User.name, schema: UserSchema },       // Import User schema if needed
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [
    TaskService,
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ], // Export TaskService and Task model for use in other modules
})
export class TasksModule {}
