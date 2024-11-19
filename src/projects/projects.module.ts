import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './entities/project.schema';
import { ProjectController } from './projects.controller';
import { ProjectService } from './projects.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]), // Define the User model
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectsModule {}
