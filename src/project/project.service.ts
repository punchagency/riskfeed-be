import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import Project from '@/models/project.model';
import CONFIG from '@/config/config';
import catchError from '@/utils/catchError';
import { logError, logInfo } from '@/utils/SystemLogs';
import Validate from '@/utils/Validate';

@Injectable()
export class ProjectService {
  async create(userId: string, createProjectDto: CreateProjectDto, files?: { propertyImages?: any[]; propertyDocuments?: any[] }) {
    if (createProjectDto.minBudget > createProjectDto.maxBudget) {
      throw new BadRequestException('minBudget cannot exceed maxBudget');
    }

    const propertyImages = files?.propertyImages?.map(file => file.location) || [];
    const propertyDocuments = files?.propertyDocuments?.map(file => file.location) || [];

    const [error, project] = await catchError(
      Project.create({
        ...createProjectDto,
        homeowner: userId as any,
        property: {
          ...createProjectDto.property,
          images: propertyImages,
          documents: propertyDocuments,
        },
      })
    );

    if (error) {
      logError({ message: 'Failed to create project', source: 'ProjectService.create', error });
      throw new BadRequestException('Failed to create project');
    }

    logInfo({ message: 'Project created', source: 'ProjectService.create', additionalData: { projectId: project._id, userId } });

    return { success: true, data: project, message: 'Project created successfully' };
  }

  async findAll({userId, userRole, page = 1, limit = CONFIG.settings.PAGINATION_LIMIT, search, status, riskLevel, minBudget, maxBudget }:{userId: string, userRole: string, page: number, limit?: number, search?: string, status?: string, riskLevel?: string, minBudget?: number, maxBudget?: number}) {
    const query: any = {};

    if (userRole === 'user') {
      query.homeowner = userId;
    }

    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'property.type': { $regex: search, $options: 'i' } },
        { 'property.ownerName': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (minBudget !== undefined) query.minBudget = { $gte: minBudget };
    if (maxBudget !== undefined) query.maxBudget = { $lte: maxBudget };

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query).populate('selectedContractor', 'businessName').skip(skip).limit(limit).lean(),
      Project.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        items: projects,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    };
  }

  async findOne(projectId: string, userId: string, userRole: string) {
    if (!Validate.mongoId(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const [error, project] = await catchError(
      Project.findById(projectId)
        .populate('homeowner', 'firstName lastName email')
        .populate('selectedContractor')
        .populate('acceptedProposal')
        .lean()
    );

    if (error) {
      logError({ message: 'Failed to fetch project', source: 'ProjectService.findOne', error });
      throw new BadRequestException('Failed to fetch project');
    }

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return { success: true, data: project };
  }

  async update(projectId: string, userId: string, updateProjectDto: UpdateProjectDto, files?: { propertyImages?: any[]; propertyDocuments?: any[] }) {
    if (!Validate.mongoId(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    if (updateProjectDto.minBudget && updateProjectDto.maxBudget && updateProjectDto.minBudget > updateProjectDto.maxBudget) {
      throw new BadRequestException('minBudget cannot exceed maxBudget');
    }

    const [findError, project] = await catchError(Project.findById(projectId));

    if (findError) {
      logError({ message: 'Failed to find project', source: 'ProjectService.update', error: findError });
      throw new BadRequestException('Failed to find project');
    }

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.homeowner.toString() !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    if (project.status !== 'draft' && project.status !== 'published') {
      throw new ForbiddenException('Can only update projects with draft or published status');
    }

    const propertyImages = files?.propertyImages?.map(file => file.location) || [];
    const propertyDocuments = files?.propertyDocuments?.map(file => file.location) || [];

    if (updateProjectDto.property) {
      const existingImages = project.property?.images || [];
      const existingDocuments = project.property?.documents || [];

      updateProjectDto.property = {
        ...updateProjectDto.property,
        images: [...existingImages, ...propertyImages],
        documents: [...existingDocuments, ...propertyDocuments],
      } as any;
    }

    Object.assign(project, updateProjectDto);

    const [saveError, updatedProject] = await catchError(project.save());

    if (saveError) {
      logError({ message: 'Failed to update project', source: 'ProjectService.update', error: saveError });
      throw new BadRequestException('Failed to update project');
    }

    logInfo({ message: 'Project updated', source: 'ProjectService.update', additionalData: { projectId, userId } });

    return { success: true, data: updatedProject, message: 'Project updated successfully' };
  }
}
