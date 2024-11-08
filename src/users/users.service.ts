import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.schema';
import { Project } from 'src/projects/entities/project.schema';
import { UserLoginDto, UserSignupDto } from './dto/user-login/user-login.dto';
import { ProjectDto } from 'src/projects/dto/create-project.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private jwtService: JwtService,
  ) {}

  async signUp(userSignupDto: UserSignupDto): Promise<User> {
    const { username, email, password } = userSignupDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async login(userLoginDto: UserLoginDto): Promise<{ accessToken: string }> {
    const { email, password } = userLoginDto;
    const user = await this.userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async projectEntry(projectDto: ProjectDto, userId: string): Promise<Project> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newProject = new this.projectModel({ ...projectDto, user: user._id });
    const savedProject = await newProject.save();

    user.projects.push(savedProject._id as Types.ObjectId);
    await user.save();

    return savedProject;
  }
}
