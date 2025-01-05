// src/projects/projects.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/users/entities/user.schema';
import { Project } from './entities/project.schema';
import { Task } from 'src/tasks/entities/task.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(User.name) private readonly userModel: Model<User>, // Inject User model for validation
    @InjectModel(Task.name) private readonly taskModel: Model<Task>, // Inject Task model for task operations
  ) {}

  // Create a new project
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const {
      projectManager,
      teamMembers,
      name,
      description,
      budget,
      deadline,
      methodology,
      cahierDeChargeUrl,
    } = createProjectDto;
  
    // Validate projectManager
    if (!Types.ObjectId.isValid(projectManager)) {
      throw new BadRequestException('Invalid Project Manager ID format.');
    }
    const projectManagerId = new Types.ObjectId(projectManager);
  
    // Validate teamMembers
    const teamMemberIds = teamMembers.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid Team Member ID format: ${id}`);
      }
      return new Types.ObjectId(id);
    });
  
    // Ensure projectManager exists
    const manager = await this.userModel.findById(projectManagerId);
    if (!manager) {
      throw new NotFoundException(`Project Manager with ID ${projectManager} not found.`);
    }
  
    // Ensure all teamMembers exist
    const members = await this.userModel.find({ _id: { $in: teamMemberIds } });
    if (members.length !== teamMemberIds.length) {
      throw new BadRequestException('One or more team members do not exist.');
    }
  
    // Proceed with project creation
    const project = new this.projectModel({
      name,
      description,
      budget,
      deadline,
      methodology,
      projectManager: projectManagerId,
      teamMembers: teamMemberIds,
      cahierDeChargeFileUrl: cahierDeChargeUrl,
    });
  
    return project.save();
  }

  // Retrieve all projects
  async findAll(): Promise<Project[]> {
    // Remove populate to return IDs as strings
    return this.projectModel.find().exec();
  }

  // Retrieve projects by manager or member
  async findByManagerOrMember(userId: string): Promise<Project[]> {
    if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid User ID format.');
    }
    const objectId = new Types.ObjectId(userId);
    return this.projectModel.find({
        $or: [
            { projectManager: objectId },
            { teamMembers: objectId }
        ]
    }).exec();
  }

  // Retrieve a single project by ID
  async findOne(projectId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }
    return project;
  }

  // Update a project by ID
  async update(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid Project ID format.');
    }

    // Validate and ensure all provided IDs exist
    if (updateProjectDto.projectManager) {
      if (!Types.ObjectId.isValid(updateProjectDto.projectManager)) {
        throw new BadRequestException('Invalid Project Manager ID format.');
      }
      const manager = await this.userModel.findById(updateProjectDto.projectManager);
      if (!manager) {
        throw new NotFoundException(
          `Project Manager with ID ${updateProjectDto.projectManager} not found.`,
        );
      }
    }

    if (updateProjectDto.teamMembers) {
      const members = await this.userModel.find({
        _id: { $in: updateProjectDto.teamMembers },
      });
      if (members.length !== updateProjectDto.teamMembers.length) {
        throw new BadRequestException('One or more team members do not exist.');
      }
    }

    const updatedProject = await this.projectModel
      .findOneAndUpdate(
        { _id: projectId }, // Use _id
        { $set: updateProjectDto },
        { new: true, runValidators: true },
      )
      .populate('projectManager', '-password')
      .populate('teamMembers', '-password')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    return updatedProject;
  }

  // Delete a project by ID
  async delete(projectId: string): Promise<{ message: string }> {
    const result = await this.projectModel.deleteOne({ _id: projectId }).exec(); // Use _id
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }
    return { message: 'Project deleted successfully.' };
  }

  // Add a team member to the project
  async addTeamMember(
    projectId: string,
    memberId: string, // Change type to string
  ): Promise<Project> {
    const project = await this.findOne(projectId);

    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid Member ID format.');
    }

    const memberObjectId = new Types.ObjectId(memberId);

    // Check if member exists
    const member = await this.userModel.findById(memberObjectId);
    if (!member) {
      throw new NotFoundException(`User with ID ${memberId} not found.`);
    }

    if (project.teamMembers.includes(memberObjectId)) {
      throw new BadRequestException('Member is already part of the project.');
    }

    project.teamMembers.push(memberObjectId);
    return project.save();
  }

  // Remove a team member from the project
  async removeTeamMember(
    projectId: string,
    memberId: string, // Change type to string
  ): Promise<Project> {
    const project = await this.findOne(projectId);

    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid Member ID format.');
    }

    const memberObjectId = new Types.ObjectId(memberId);

    if (!project.teamMembers.includes(memberObjectId)) {
      throw new BadRequestException('Member is not part of the project.');
    }

    project.teamMembers = project.teamMembers.filter(
      (member) => !member.equals(memberObjectId),
    );

    return project.save();
  }

  // **New Method**: Fetch tasks related to a specific project
  async getTasksByProject(projectId: string): Promise<Task[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid Project ID format.');
    }

    const objectId = new Types.ObjectId(projectId);

    // Verify that the project exists
    const project = await this.projectModel.findById(objectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    // Fetch tasks that have the projectId
    const tasks = await this.taskModel.find({ projectId: objectId }).exec();

    return tasks;
  }
}
