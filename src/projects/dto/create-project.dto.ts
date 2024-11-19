import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  IsDate,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Method } from '../entities/method.enum';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Unique project identifier.',
    example: 101,
  })
  @IsNumber()
  @Min(1)
  projectId: number;

  @ApiProperty({
    description: 'Name of the project.',
    example: 'Website Redesign',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Brief description of the project.',
    example: 'A project to redesign the corporate website.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Start date of the project.',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the project.',
    example: '2024-06-01T00:00:00.000Z',
    type: String,
  })
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: 'Budget allocated for the project.',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiProperty({
    description: 'Project management methodology.',
    enum: Method,
    example: 'Kanban',
  })
  @IsNotEmpty()
  @IsEnum(Method, { message: 'Method must be one of Kanban, XP, or Scrum' })
  method: Method;
}
