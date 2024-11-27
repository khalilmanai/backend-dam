import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/users/entities/user.enum';

export class BaseUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'securepassword123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    example: UserRole.MEMBER,
  })
  
  @IsString()
  role: UserRole;
}
