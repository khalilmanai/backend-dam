import { PartialType } from '@nestjs/mapped-types';
import { UserLoginDto } from './user-login/user-login.dto';

export class UpdateUserDto extends PartialType(UserLoginDto) {}
