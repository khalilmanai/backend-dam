import { PartialType } from '@nestjs/mapped-types';
import { ProjectDto } from './create-project.dto';
export class UpdateProjectDto extends PartialType(ProjectDto) {}
