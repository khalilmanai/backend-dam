import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './entities/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}

  async create(projectDto: ProjectDto): Promise<Project> {
    try {
      const newProject = new this.projectModel(projectDto);
      return await newProject.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      return await this.projectModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve projects');
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id).exec();
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid project ID format');
    }
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    try {
      const updatedProject = await this.projectModel
        .findByIdAndUpdate(id, updateProjectDto, { new: true })
        .exec();
      if (!updatedProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update project');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const result = await this.projectModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return { message: 'Project deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete project');
    }
  }
}
