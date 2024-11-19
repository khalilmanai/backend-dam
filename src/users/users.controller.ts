// user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';

import { UserSignupDto } from './dto/user-login/user-login.dto';
import { User } from './entities/user.schema';
import { UserService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Create a new user in the db without Auth/password-hash',
  })
  @Post()
  async create(@Body() userSignupDto: UserSignupDto): Promise<User> {
    return this.userService.create(userSignupDto);
  }

  @ApiOperation({
    summary: 'Retrieve all users from database',
  })
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
  @ApiOperation({
    summary: 'Retrieve  user by his Id',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
  @ApiOperation({
    summary: 'Update user by his Id',
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userSignupDto: UserSignupDto,
  ): Promise<User> {
    return this.userService.update(id, userSignupDto);
  }
  @ApiOperation({
    summary: 'Delete user by his Id',
  })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
