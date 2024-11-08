import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './entities/user.schema';
import { UserLoginDto, UserSignupDto } from './dto/user-login/user-login.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Post('sign-up')
  async signUp(@Body() userSignUpDto: UserSignupDto) {
    return this.userService.signUp(userSignUpDto);
  }
  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    return this.userService.login(userLoginDto);
  }
}
