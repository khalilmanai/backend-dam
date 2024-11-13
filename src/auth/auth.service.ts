import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import {
  UserLoginDto,
  UserSignupDto,
} from 'src/users/dto/user-login/user-login.dto';
import { User } from 'src/users/entities/user.schema';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(userSignupDto: UserSignupDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userSignupDto.password, 10);
    const userToCreate = { ...userSignupDto, password: hashedPassword };
    return this.userService.create(userToCreate);
  }

  async login(userLoginDto: UserLoginDto): Promise<{ accessToken: string }> {
    const { email, password } = userLoginDto;
    const user = await this.userService.findUserByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { username: user.username, sub: user._id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
