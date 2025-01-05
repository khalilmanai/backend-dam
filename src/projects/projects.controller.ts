// src/projects/project.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectService } from './projects.service';
import { Types } from 'mongoose';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all projects' })
  @ApiResponse({ status: 200, description: 'List of projects.' })
  async findAll() {
    return this.projectService.findAll();
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Retrieve a project by Project ID' })
  @ApiResponse({ status: 200, description: 'Project details.' })
  @ApiResponse({ status: 400, description: 'Invalid Project ID format.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async findOne(@Param('projectId') projectId: string) {
    const isValid = Types.ObjectId.isValid(projectId);
    console.log(`Project ID: ${projectId}, isValid: ${isValid}`);
    
    if (!isValid) {
      throw new BadRequestException('Invalid Project ID format.');
    }

    const project = await this.projectService.findOne(projectId);
    console.log(`Project found: ${JSON.stringify(project)}`);
    
    return project;
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Update a project by Project ID' })
  @ApiResponse({ status: 200, description: 'Project updated successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async update(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid Project ID format.');
    }
    return this.projectService.update(projectId, updateProjectDto);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Delete a project by Project ID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async delete(@Param('projectId') projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid Project ID format.');
    }
    return this.projectService.delete(projectId);
  }

  @Post(':projectId/add-member/:memberId')
  @ApiOperation({ summary: 'Add a team member to a project' })
  @ApiResponse({ status: 200, description: 'Team member added successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Project or User not found.' })
  async addTeamMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string, // Change type to string
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid Project ID format.');
    }
    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid Member ID format.');
    }
    return this.projectService.addTeamMember(projectId, memberId);
  }

// src/projects/project.controller.ts
@Get('/user/:userId')
@ApiOperation({ summary: 'Retrieve projects managed by or involving a specific user' })
@ApiResponse({ status: 200, description: 'List of projects.' })
@ApiResponse({ status: 400, description: 'Invalid User ID format.' })
async findByUser(@Param('userId') userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid User ID format.');
    }
    return this.projectService.findByManagerOrMember(userId);
}


// **New Endpoint**: Get tasks for a specific project
@Get(':projectId/tasks')
@ApiOperation({ summary: 'Retrieve tasks for a specific project' })
@ApiResponse({ status: 200, description: 'List of tasks for the project.' })
@ApiResponse({ status: 400, description: 'Invalid Project ID format.' })
@ApiResponse({ status: 404, description: 'Project not found.' })
async getTasksByProject(@Param('projectId') projectId: string) {
  if (!Types.ObjectId.isValid(projectId)) {
    throw new BadRequestException('Invalid Project ID format.');
  }
  return this.projectService.getTasksByProject(projectId);
}


  @Post(':projectId/remove-member/:memberId')
  @ApiOperation({ summary: 'Remove a team member from a project' })
  @ApiResponse({ status: 200, description: 'Team member removed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Project or User not found.' })
  async removeTeamMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string, // Change type to string
  ) {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid Project ID or Member ID format.');
    }
    return this.projectService.removeTeamMember(projectId, memberId);
  }
}
