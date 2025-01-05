import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({ example: 'Updated Project Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated description...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '10000', required: false })
  @IsString()
  @IsOptional()
  budget?: string;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ example: 'Agile', required: false })
  @IsString()
  @IsOptional()
  methodology?: string;

  @ApiProperty({ example: '64b5f1d2e4a4e5c2b5d12345', required: false })
  @IsOptional()
  projectManager?: Types.ObjectId; // Change to ObjectId type

  @ApiProperty({ type: [String], example: ['64b5f1d2e4a4e5c2b5d12346'], required: false })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  teamMembers?: Types.ObjectId[]; // Change to ObjectId type
}
