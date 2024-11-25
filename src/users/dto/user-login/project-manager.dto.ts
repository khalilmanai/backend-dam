import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class ProjectManagerSignupDto extends BaseUserDto {
  @ApiProperty({
    description: 'List of team member IDs managed by the project manager',
    type: [String],
    example: ['641d8f2f4b7e4d2d8d0f7c93', '641d8f2f4b7e4d2d8d0f7c94'],
  })
  @IsNotEmpty()
  @IsArray()
  teamOfMembers: string[];
}
