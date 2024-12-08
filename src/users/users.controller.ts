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
  Patch,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { User } from './entities/user.schema';
import { UserService } from './users.service';
import { ProjectManagerSignupDto } from './dto/user-login/project-manager.dto';
import { MemberSignupDto } from './dto/user-login/member.dto';
import { UserRole } from './entities/user.enum';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user based on role.
   * @param userDto - Data transfer object for user creation.
   * @returns The created user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user.' })
  async create(
    @Body() userDto: ProjectManagerSignupDto | MemberSignupDto,
  ): Promise<User> {
    return this.userService.create(userDto);
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
   * @param userDto - Updated user data.
   * @returns The updated user.
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user information by ID.' })
  async update(
    @Param('id') id: string,
    @Body() userDto: ProjectManagerSignupDto | MemberSignupDto,
  ): Promise<User> {
    return this.userService.update(id, userDto);
  }

  /**
   * Delete a user by ID.
   * @param id - ID of the user to delete.
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

  @Patch('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() userSignupDto: ProjectManagerSignupDto | MemberSignupDto,
  ): Promise<User> {
    const { role } = userSignupDto;

    // Validate role-specific fields
    if (role === UserRole.PROJECT_MANAGER) {
      const { teamOfMembers } = userSignupDto as ProjectManagerSignupDto;
      if (!teamOfMembers) {
        throw new BadRequestException(
          'Team of members is required for Project Manager',
        );
      }
    } else if (role === UserRole.MEMBER) {
      const { specialty } = userSignupDto as MemberSignupDto;
      if (!specialty) {
        throw new BadRequestException('Specialty is required for Member');
      }
    } else {
      throw new BadRequestException('Invalid role provided.');
    }

    try {
      const updatedUser = await this.userService.update(id, userSignupDto);
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }
}
