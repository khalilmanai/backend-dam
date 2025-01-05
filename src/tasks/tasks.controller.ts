// src/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaskService } from './tasks.service';
import { Types } from 'mongoose';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Create a new task.
   * @param createTaskDto - Data Transfer Object containing task details.
   * @returns The created Task document.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  /**
   * Retrieve all tasks.
   * @returns An array of Task documents.
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks.' })
  async getAllTasks() {
    return this.taskService.getAllTasks();
  }

  /**
   * Retrieve a task by its MongoDB ObjectId.
   * @param id - The MongoDB ObjectId of the task.
   * @returns The Task document.
   * @throws BadRequestException if the Task ID format is invalid.
   * @throws NotFoundException if the task is not found.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a task by Task ID' })
  @ApiResponse({ status: 200, description: 'Task details.' })
  @ApiResponse({ status: 400, description: 'Invalid Task ID format.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async getTaskById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Task ID format.');
    }
    return this.taskService.getTaskById(id);
  }

  /**
   * Retrieve tasks associated with a specific project.
   * @param projectId - The MongoDB ObjectId of the project.
   * @returns An array of Task documents.
   * @throws BadRequestException if the Project ID format is invalid.
   */
  @Get('/project/:projectId')
  @ApiOperation({ summary: 'Retrieve tasks for a specific project' })
  @ApiResponse({ status: 200, description: 'List of tasks for the project.' })
  @ApiResponse({ status: 400, description: 'Invalid Project ID format.' })
  async getTasksByProject(@Param('projectId') projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid Project ID format.');
    }
    return this.taskService.findByProject(projectId);
  }

  /**
   * Update a task by its MongoDB ObjectId.
   * @param id - The MongoDB ObjectId of the task.
   * @param updateTaskDto - Data Transfer Object containing fields to update.
   * @returns The updated Task document.
   * @throws BadRequestException if the Task ID format is invalid.
   * @throws NotFoundException if the task is not found.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Task ID format.');
    }
    return this.taskService.updateTask(id, updateTaskDto);
  }

  /**
   * Delete a task by its MongoDB ObjectId.
   * @param id - The MongoDB ObjectId of the task.
   * @returns A confirmation message.
   * @throws BadRequestException if the Task ID format is invalid.
   * @throws NotFoundException if the task is not found.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid Task ID format.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async deleteTask(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Task ID format.');
    }
    return this.taskService.deleteTask(id);
  }

  /**
   * Retrieve a task by its unique taskId.
   * This endpoint can be useful for administrative purposes or debugging.
   * @param taskId - The unique identifier of the task.
   * @returns The Task document.
   * @throws BadRequestException if the taskId is not provided.
   * @throws NotFoundException if the task is not found.
   */
  @Get('/taskid/:taskId')
  @ApiOperation({ summary: 'Retrieve a task by its unique taskId' })
  @ApiResponse({ status: 200, description: 'Task details.' })
  @ApiResponse({ status: 400, description: 'Task ID must be provided.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async getTaskByTaskId(@Param('taskId') taskId: string) {
    if (!taskId) {
      throw new BadRequestException('Task ID must be provided.');
    }
    return this.taskService.findByTaskId(taskId);
  }
}
