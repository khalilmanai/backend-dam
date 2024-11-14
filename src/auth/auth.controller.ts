import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  UserLoginDto,
  UserSignupDto,
} from 'src/users/dto/user-login/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // User sign-up endpoint
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() userSignupDto: UserSignupDto) {
    return this.authService.signup(userSignupDto);
  }

  // User login endpoint
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto);
  }

  // Refresh token endpoint
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('userId') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }

  // Request password reset (sends email with reset token)
  @Post('request-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body('email') email: string) {
    try {
      await this.authService.requestPasswordReset(email);
      return {
        status: 'success',
        message: 'Password reset request has been sent to the email.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Reset password using reset token
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('userId') userId: string,
    @Body('resetToken') resetToken: string,
    @Body('newPassword') newPassword: string,
  ) {
    try {
      await this.authService.resetPassword(userId, resetToken, newPassword);
      return {
        status: 'success',
        message: 'Password has been reset successfully.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Forgot password functionality (sends a verification code via email)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.authService.sendVerificationCode(body.email);
      return {
        status: 'success',
        message: 'Verification code sent to email.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Verify the code sent to email and reset password with the code
  @Post('reset-password-with-code')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    try {
      await this.authService.resetPasswordWithCode(email, code, newPassword);
      return {
        status: 'success',
        message: 'Password has been reset successfully.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
