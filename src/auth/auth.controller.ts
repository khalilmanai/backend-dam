import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  UserLoginDto,
  UserSignupDto,
} from 'src/users/dto/user-login/user-login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User sign-up endpoint.
   * Registers a new user with role-specific validations.
   * @param userSignupDto - User sign-up data transfer object.
   * @returns Confirmation of user creation.
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user with role-specific validations.',
  })
  async signup(@Body() userSignupDto: UserSignupDto) {
    const { role, teamOfMembers, specialty } = userSignupDto;

    if (role === 'PROJECT_MANAGER' && !teamOfMembers) {
      throw new BadRequestException(
        'Team of members is required for Project Manager role.',
      );
    }

    if (role === 'MEMBER' && !specialty) {
      throw new BadRequestException('Specialty is required for Member role.');
    }

    return this.authService.signup(userSignupDto);
  }

  /**
   * User login endpoint.
   * Authenticates a user and generates a JWT.
   * @param userLoginDto - User login data transfer object.
   * @returns Access token and refresh token.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and return JWT tokens.' })
  async login(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto);
  }

  /**
   * Refresh token endpoint.
   * Generates a new access token using the refresh token.
   * @param userId - ID of the user.
   * @param refreshToken - Valid refresh token.
   * @returns New access token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh a user’s access token.' })
  async refresh(
    @Body('userId') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }

  /**
   * Request password reset.
   * Sends an email with a password reset token.
   * @param email - User’s email address.
   * @returns Success message.
   */
  @Post('request-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a password reset request to the user’s email.',
  })
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

  /**
   * Reset password using a token.
   * @param userId - ID of the user.
   * @param resetToken - Token for resetting the password.
   * @param newPassword - New password.
   * @returns Success or error message.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user’s password using a reset token.' })
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

  /**
   * Forgot password functionality.
   * Sends a verification code to the user’s email.
   * @param body - Request body containing the user’s email.
   * @returns Success or error message.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a verification code to reset password.' })
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

  /**
   * Reset password with a verification code.
   * @param email - User’s email address.
   * @param code - Verification code sent to the email.
   * @param newPassword - New password to set.
   * @returns Success or error message.
   */
  @Post('reset-password-with-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a verification code.' })
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

  /**
   * User logout endpoint.
   * Logs out the user by clearing their refresh token.
   * @param userId - ID of the user to log out.
   * @returns Logout success message.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out the user by clearing the refresh token.' })
  async logout(@Body('userId') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully.' };
  }
}
