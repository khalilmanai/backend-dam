import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { Project } from 'src/projects/entities/project.schema';

import { UserRole } from './entities/user.enum';
import { ProjectManagerSignupDto } from './dto/user-login/project-manager.dto';
import { MemberSignupDto } from './dto/user-login/member.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  /**
   * Create a new user based on their role.
   */
  async create(
    userSignupDto: ProjectManagerSignupDto | MemberSignupDto,
  ): Promise<User> {
    const { role } = userSignupDto;

    // Validate and process based on role
    let userToCreate: any = { ...userSignupDto };

    if (role === UserRole.PROJECT_MANAGER) {
      const { teamOfMembers } = userSignupDto as ProjectManagerSignupDto;
      if (!teamOfMembers) {
        throw new BadRequestException(
          'Team of members is required for Project Manager',
        );
      }
      userToCreate.teamOfMembers = teamOfMembers;
    } else if (role === UserRole.MEMBER) {
      const { specialty } = userSignupDto as MemberSignupDto;
      if (!specialty) {
        throw new BadRequestException('Specialty is required for Member');
      }
      userToCreate.specialty = specialty;
    } else {
      throw new BadRequestException('Invalid role provided.');
    }

    try {
      const newUser = new this.userModel(userToCreate);
      return await newUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  /**
   * Find all users.
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users');
    }
  }

  /**
   * Find a user by ID.
   */
  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw new InternalServerErrorException('Error finding user');
    }
  }

  /**
   * Find a user by username.
   */
  async findOneByUsername(username: string): Promise<User> {
    try {
      const user = await this.userModel
        .findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } })
        .exec();
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by username');
    }
  }

  /**
   * Find a user by email.
   */
  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  /**
   * Update a user by ID.
   */
  async update(
    id: string,
    userSignupDto: ProjectManagerSignupDto | MemberSignupDto,
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
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, userSignupDto, { new: true })
        .exec();
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

  /**
   * Delete a user by ID.
   */
  async delete(id: string): Promise<void> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  /**
   * Update verification code for user.
   */
  async updateVerificationCode(
    userId: string,
    code: string,
    expiration: Date,
  ): Promise<void> {
    try {
      await this.userModel
        .findByIdAndUpdate(userId, {
          verificationCode: code,
          verificationCodeExpiration: expiration,
        })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating verification code',
      );
    }
  }

  /**
   * Clear verification code for user.
   */
  async clearVerificationCode(userId: string): Promise<void> {
    try {
      await this.userModel
        .findByIdAndUpdate(userId, {
          verificationCode: null,
          verificationCodeExpiration: null,
        })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error clearing verification code',
      );
    }
  }

  /**
   * Update password for user.
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      await this.userModel
        .findByIdAndUpdate(userId, { password: newPassword })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Error updating password');
    }
  }
}
