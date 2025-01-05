import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Alpha' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Project description...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '5000' })
  @IsString()
  @IsNotEmpty()
  budget: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({ example: 'SCRUM' })
  @IsString()
  @IsNotEmpty()
  methodology: string;

  @ApiProperty({ example: '64b5f1d2e4a4e5c2b5d12345' })
  @IsNotEmpty()
  @IsMongoId() // Ensure this is a valid ObjectId
  projectManager: string;
  
  @ApiProperty({ type: [String], example: ['64b5f1d2e4a4e5c2b5d12346'] })
  @IsArray()
  @IsMongoId({ each: true }) // Ensure all elements are valid ObjectIds
  teamMembers: string[];
  

  @ApiProperty({ required: false })
  cahierDeChargeUrl?: string;
}
