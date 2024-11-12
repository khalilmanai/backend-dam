import {
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { Method } from '../entities/method.enum';

export class ProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teams?: string[];

  @IsNotEmpty()
  @IsEnum(Method, { message: 'Method must be one of Kanban, XP, or Scrum' })
  method: Method;
}
