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
import { EmailService } from 'src/mailing/email.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(userSignupDto: UserSignupDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userSignupDto.password, 10);
    const userToCreate = { ...userSignupDto, password: hashedPassword };
    return this.userService.create(userToCreate);
  }

  async login(
    userLoginDto: UserLoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = userLoginDto;
    const user = await this.userService.findUserByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { username: user.username, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // Customize expiration as needed

    // Hash the refresh token and store it in the user document
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return { accessToken, refreshToken };
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findOne(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access Denied');

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid)
      throw new UnauthorizedException('Invalid refresh token');

    const payload = { username: user.username, sub: user._id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // Generate and hash a reset token
    const resetToken = this.jwtService.sign(
      { sub: user._id },
      { expiresIn: '1h' },
    );
    user.resetToken = await bcrypt.hash(resetToken, 10);
    await user.save();

    // Send resetToken to user via email (implement emailing separately)
  }

  async resetPassword(
    userId: string,
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.findOne(userId);
    if (!user || !user.resetToken)
      throw new UnauthorizedException('Invalid reset token');

    const isResetTokenValid = await bcrypt.compare(resetToken, user.resetToken);
    if (!isResetTokenValid)
      throw new UnauthorizedException('Invalid reset token');

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null; // Clear the reset token after successful reset
    await user.save();
  }

  async sendVerificationCode(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const verificationCode = (
      Math.floor(Math.random() * 900000) + 100000
    ).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

    await this.userService.updateVerificationCode(
      user.id,
      verificationCode,
      expirationTime,
    );
    await this.emailService.sendVerificationEmail(email, verificationCode);
  }

  async verifyCode(email: string, code: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    if (!user || !user.verificationCode || !user.verificationCodeExpiration) {
      throw new NotFoundException('Verification code not found');
    }

    if (user.verificationCodeExpiration < new Date()) {
      throw new UnauthorizedException('Verification code has expired');
    }

    if (user.verificationCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.userService.clearVerificationCode(user.id);
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await this.verifyCode(email, code);

    const user = await this.userService.findUserByEmail(email);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);
  }
}
