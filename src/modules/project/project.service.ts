import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import Project from '@/models/project.model';
import CONFIG from '@/config/config';
import catchError from '@/utils/catchError';
import { logError, logInfo } from '@/utils/SystemLogs';
import Validate from '@/utils/Validate';
import Contractor from '@/models/contractor.model';
import { addEmailJob } from '@/integrations/QueueManager';

@Injectable()
export class ProjectService {
  async create(userId: string, createProjectDto: CreateProjectDto, files?: { projectImages?: any[]; projectDocuments?: any[] }) {
    if (createProjectDto.minBudget > createProjectDto.maxBudget) {
      throw new BadRequestException('minBudget cannot exceed maxBudget');
    }

    const { propertyId, ...restDto } = createProjectDto;
    const projectImages = files?.projectImages?.map(file => file.location) || [];
    const projectDocuments = files?.projectDocuments?.map(file => file.location) || [];

    const [error, project] = await catchError(
      Project.create({
        ...restDto,
        homeowner: userId as any,
        property: propertyId,
        status: "published",
        projectImages,
        projectDocuments,
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
      ];
    }
    
    if (minBudget !== undefined) query.minBudget = { $gte: minBudget };
    if (maxBudget !== undefined) query.maxBudget = { $lte: maxBudget };

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query).populate('selectedContractor', 'businessName').populate('property').skip(skip).limit(limit).lean(),
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
  async findOne(projectId: string) {
    if (!Validate.mongoId(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const [error, project] = await catchError(
      Project.findById(projectId)
        .populate('homeowner', 'firstName lastName email')
        .populate('selectedContractor')
        .populate('acceptedProposal')
        .populate('property')
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
  async update(projectId: string, userId: string, updateProjectDto: UpdateProjectDto, files?: { projectImages?: any[]; projectDocuments?: any[] }) {
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

    const { propertyId, ...restUpdateData } = updateProjectDto;

    if (propertyId) {
      project.property = propertyId as any;
    }

    Object.assign(project, restUpdateData);

    const projectImages = files?.projectImages?.map(file => file.location) || [];
    const projectDocuments = files?.projectDocuments?.map(file => file.location) || [];

    if (projectImages.length) {
      project.projectImages = [...(project.projectImages || []), ...projectImages];
    }
    if (projectDocuments.length) {
      project.projectDocuments = [...(project.projectDocuments || []), ...projectDocuments];
    }

    const [saveError, updatedProject] = await catchError(project.save());

    if (saveError) {
      logError({ message: 'Failed to update project', source: 'ProjectService.update', error: saveError });
      throw new BadRequestException('Failed to update project');
    }

    logInfo({ message: 'Project updated', source: 'ProjectService.update', additionalData: { projectId, userId } });

    return { success: true, data: updatedProject, message: 'Project updated successfully' };
  }
  async suggestContractorForProject(projectId: string, userId: string) {
    if (!Validate.mongoId(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const [error, project] = await catchError(
      Project.findById(projectId).populate('property').lean()
    );

    if (error) {
      logError({ message: 'Failed to fetch project', source: 'ProjectService.suggestContractorForProject', error });
      throw new BadRequestException('Failed to fetch project');
    }

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.homeowner.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only view suggestions for your own projects');
    }

    const projectType = project.projectType;
    const property = project.property as any;
    const projectCity = property?.address?.city;
    const projectState = property?.address?.state;
    const invitedContractors = project.invitedContractors || [];

    // Find contractors that provide the required service
    const [contractorsError, contractors] = await catchError(
      Contractor.find({ 
        _id: { $nin: invitedContractors },
        services: { $in: [projectType] } 
      }).populate('user').lean()
    );

    if (contractorsError) {
      logError({ message: 'Failed to fetch contractors', source: 'ProjectService.suggestContractorForProject', error: contractorsError });
      throw new BadRequestException('Failed to fetch contractors');
    }

    const evaluatedContractors = contractors.map(contractor => {
      let matchPercentage = 50; // Base percentage for matching the service
      let riskFactor = 100; // Base risk starts at highest

      // Evaluate Match Percentage
      if (projectCity && contractor.serviceAreas?.includes(projectCity)) {
        matchPercentage += 20;
      } else if (projectState && contractor.serviceAreas?.includes(projectState)) {
        matchPercentage += 10;
      }

      if (contractor.verification?.businessVerificationStatus === 'verified') {
        matchPercentage += 15;
      }

      const averageRating = contractor.ratings?.averageRatings || 0;
      if (averageRating >= 4) {
        matchPercentage += 15;
      } // If less than 4, don't add more percentage

      // Cap at 100%
      matchPercentage = Math.min(matchPercentage, 100);

      // Evaluate Risk Factor
      const isFullyVerified = 
        contractor.verification?.businessVerificationStatus === 'verified' &&
        contractor.verification?.licenseValidationStatus === 'verified' &&
        contractor.verification?.insuranceCheckStatus === 'verified' &&
        contractor.verification?.backgroundScreeningStatus === 'verified' &&
        contractor.verification?.financialHealthStatus === 'verified';

      if (isFullyVerified) riskFactor -= 40;
      if (contractor.yearsInBusiness > 3) riskFactor -= 20;
      if (contractor.isBonded) riskFactor -= 20;
      
      const now = new Date();
      if (contractor.insurance?.expiryDate && new Date(contractor.insurance.expiryDate) > now) {
        riskFactor -= 20;
      }

      // Floor at 0%
      riskFactor = Math.max(riskFactor, 0);

      return {
        contractor: {
          _id: contractor._id,
          companyName: contractor.companyName,
          businessName: contractor.businessName,
          businessEmail: contractor.businessEmail,
          businessPhone: contractor.businessPhone,
          yearsInBusiness: contractor.yearsInBusiness,
          ratings: contractor.ratings,
          services: contractor.services,
          serviceAreas: contractor.serviceAreas,
          verification: contractor.verification,
          insurance: contractor.insurance,
        },
        matchPercentage,
        riskFactor,
      };
    });

    // Sort by match percentage (desc) and then risk factor (asc)
    evaluatedContractors.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.riskFactor - b.riskFactor;
    });

    logInfo({ message: 'Suggested contractors for project', source: 'ProjectService.suggestContractorForProject', additionalData: { projectId, userId, matchesCount: evaluatedContractors.length } });

    return { 
      success: true, 
      data: evaluatedContractors, 
      message: 'Contractors suggested successfully' 
    };
  }
  async inviteToBid(projectId: string, userId: string, contractorId: string) {
    if (!Validate.mongoId(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    if (!Validate.mongoId(contractorId)) {
      throw new BadRequestException('Invalid contractor ID');
    }

    const [error, project] = await catchError(
      Project.findById(projectId).populate('homeowner', 'firstName lastName').lean()
    );

    if (error) {
      logError({ message: 'Failed to fetch project', source: 'ProjectService.inviteToBid', error });
      throw new BadRequestException('Failed to fetch project');
    }

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.homeowner._id.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only invite contractors to your own projects');
    }

    const [contractorError, contractor] = await catchError(
      Contractor.findById(contractorId).lean()
    );

    if (contractorError) {
      logError({ message: 'Failed to fetch contractor', source: 'ProjectService.inviteToBid', error: contractorError });
      throw new BadRequestException('Failed to fetch contractor');
    }

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    const [updateError] = await catchError(
      Project.findByIdAndUpdate(projectId, { $addToSet: { invitedContractors: contractorId } })
    );

    if (updateError) {
      logError({ message: 'Failed to invite contractor', source: 'ProjectService.inviteToBid', error: updateError });
      throw new BadRequestException('Failed to invite contractor');
    }

    const homeowner = project.homeowner as any;
    const homeownerName = `${homeowner.firstName} ${homeowner.lastName}`;

    await addEmailJob({
      email: contractor.businessEmail,
      subject: `Invitation to Bid: ${project.title}`,
      html: `
        <p>Hi ${contractor.businessName || contractor.companyName},</p>
        <p><strong>${homeownerName}</strong> has invited you to bid on their project: <strong>${project.title}</strong>.</p>
        <p>Please login to your RiskFeed account to view the project details and submit your proposal and quotation.</p>
        <p>Best regards,<br>The RiskFeed Team</p>
      `,
    });

    logInfo({ message: 'Contractor invited to bid', source: 'ProjectService.inviteToBid', additionalData: { projectId, userId, contractorId } });

    return { 
      success: true, 
      message: 'Contractor invited to bid successfully' 
    };
  }
}
