import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserSignupDto } from './dto/user-login/user-login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { User } from './entities/user.schema';
import { UserService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user.
   * @param userSignupDto - Data transfer object for user sign-up.
   * @returns The created user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user.' })
  async create(@Body() userSignupDto: UserSignupDto): Promise<User> {
    return this.userService.create(userSignupDto);
  }

  /**
   * Retrieve all users.
   * @returns An array of users.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all users.' })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * Retrieve a user by ID.
   * @param id - ID of the user to retrieve.
   * @returns The user with the specified ID.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a user by ID.' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  /**
   * Retrieve a user by username.
   * @param username - Username of the user to retrieve.
   * @returns The user with the specified username.
   */
  @Get('username/:username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a user by username.' })
  async findOneByUsername(@Param('username') username: string): Promise<User> {
    return this.userService.findOneByUsername(username);
  }

  /**
   * Retrieve a user by email.
   * @param email - Email of the user to retrieve.
   * @returns The user with the specified email.
   */
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a user by email.' })
  async findUserByEmail(@Param('email') email: string): Promise<User> {
    return this.userService.findUserByEmail(email);
  }

  /**
   * Update a user's information.
   * @param id - ID of the user to update.
   * @param userSignupDto - Updated user data.
   * @returns The updated user.
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user information by ID.' })
  async update(
    @Param('id') id: string,
    @Body() userSignupDto: UserSignupDto,
  ): Promise<User> {
    return this.userService.update(id, userSignupDto);
  }

  /**
   * Delete a user by ID.
   * @param id - ID of the user to delete.
   * @returns A success message.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID.' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  /**
   * Update a user's verification code.
   * @param userId - ID of the user.
   * @param body - Object containing verification code and expiration.
   */
  @Put(':userId/verification-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update verification code for a user.' })
  async updateVerificationCode(
    @Param('userId') userId: string,
    @Body() body: { code: string; expiration: Date },
  ): Promise<void> {
    await this.userService.updateVerificationCode(
      userId,
      body.code,
      body.expiration,
    );
  }

  /**
   * Clear a user's verification code.
   * @param userId - ID of the user.
   */
  @Put(':userId/clear-verification-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear verification code for a user.' })
  async clearVerificationCode(@Param('userId') userId: string): Promise<void> {
    await this.userService.clearVerificationCode(userId);
  }

  /**
   * Update a user's password.
   * @param userId - ID of the user.
   * @param body - Object containing the new password.
   */
  @Put(':userId/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user’s password.' })
  async updatePassword(
    @Param('userId') userId: string,
    @Body() body: { newPassword: string },
  ): Promise<void> {
    await this.userService.updatePassword(userId, body.newPassword);
  }
}
