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
import { UserLoginDto, UserSignupDto } from './dto/user-login/user-login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(userSignUpDto: UserSignupDto): Promise<User> {
    try {
      const newUser = new this.userModel(userSignUpDto);
      return await newUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users');
    }
  }

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

  async findOneByUsername(username: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by username');
    }
  }

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

  async update(id: string, userSignupDto: UserSignupDto): Promise<User> {
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
