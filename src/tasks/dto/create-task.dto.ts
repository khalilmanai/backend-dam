// src/tasks/dto/create-task.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum, IsMongoId } from 'class-validator';

export enum TaskStatus {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty({ description: 'The title of the task' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the task', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The deadline of the task (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsString()
  deadline: string;

  @ApiProperty({ description: 'The budget allocated for the task' })
  @IsNotEmpty()
  @IsString()
  budget: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    default: TaskStatus.TO_DO,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ description: 'The project ID this task belongs to' })
  @IsNotEmpty()
  @IsMongoId()
  projectId: string; // Must be a valid ObjectId string

  @ApiProperty({
    description: 'The IDs of members assigned to the task',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  members: string[]; // Must be valid ObjectId strings
}
