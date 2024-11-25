import { IsNotEmpty, IsString } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class MemberSignupDto extends BaseUserDto {
  @IsNotEmpty()
  @IsString()
  specialty: string; // Required for members
}
