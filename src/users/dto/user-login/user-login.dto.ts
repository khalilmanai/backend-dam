import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/users/entities/user.enum';

export class UserLoginDto {
  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User password' })
  password: string;
}

export class UserSignupDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  // Specialty is required for MEMBERS
  @IsOptional()
  @IsString()
  specialty?: string;

  // teamOfMembers is required for PROJECT_MANAGER
  @IsOptional()
  teamOfMembers?: string[];
}
