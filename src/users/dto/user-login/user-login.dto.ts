import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}

export class UserSignupDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}
