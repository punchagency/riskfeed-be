import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetOpportunitiesDto } from './dto/get-opportunities.dto';
import Project from '@/models/project.model';
import CONFIG from '@/config/config';
import catchError from '@/utils/catchError';
import { logError, logInfo } from '@/utils/SystemLogs';
import Validate from '@/utils/Validate';
import Contractor from '@/models/contractor.model';
import User from '@/models/user.model';
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

    if (project.homeowner.toString() !== userId.toString()) {
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
    const invitedContractorIds = (project.invitations || []).map((inv: any) => inv.contractor.toString());

    // Find contractors that provide the required service
    const [contractorsError, contractors] = await catchError(
      Contractor.find({ 
        _id: { $nin: invitedContractorIds },
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
      if (contractor.yearEstablished && (new Date().getFullYear() - contractor.yearEstablished) > 3) riskFactor -= 20;
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
          yearEstablished: contractor.yearEstablished,
          yearsInBusiness: contractor.yearEstablished ? (new Date().getFullYear() - contractor.yearEstablished) : 0,
          ratings: contractor.ratings,
          services: contractor.services,
          serviceAreas: contractor.serviceAreas,
          verification: contractor.verification,
          insurance: contractor.insurance,
          companyLogo: contractor.companyLogo,
          businessEmail: contractor.businessEmail,
          teamSize: contractor.teamSize,
        },
        matchPercentage,
        riskFactor,
      };
    });

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
  async inviteToBid({projectId, userId, contractorId, message, contractorEmail }:{projectId: string, userId: string, contractorId?: string, message?: string, contractorEmail?: string}) {
    if (!Validate.mongoId(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    if (!contractorId && !contractorEmail) {
      throw new BadRequestException('Either contractorId or contractorEmail must be provided');
    }

    if (contractorId && !Validate.mongoId(contractorId)) {
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

    // Only allow invitations on published or in_progress projects
    if (project.status !== 'published' && project.status !== 'in_progress') {
      throw new BadRequestException(`Cannot invite contractors to a project with status '${project.status}'`);
    }

    let targetContractorId = contractorId;
    let contractorEmailToSend = contractorEmail;
    let contractorName = 'Contractor';
    let isNewContractor = false;

    if (contractorEmail) {
      const [userError, existingUser] = await catchError(User.findOne({ email: contractorEmail.toLowerCase().trim() }));
      if (userError) throw new BadRequestException('Failed to check user by email');

      if (existingUser) {
        if (existingUser.role !== 'contractor') {
          throw new BadRequestException('User with this email exists but is not a contractor');
        }
        const [contractorError, existingContractor] = await catchError(Contractor.findOne({ user: existingUser._id }).lean());
        if (contractorError) throw new BadRequestException('Failed to check contractor by email');
        if (!existingContractor) throw new BadRequestException('Contractor profile not found for this user');

        targetContractorId = existingContractor._id.toString();
        contractorEmailToSend = existingContractor.businessEmail || existingUser.email;
        contractorName = existingContractor.businessName || existingContractor.companyName || 'Contractor';
      } else {
        isNewContractor = true;
        const [createUserError, newUser] = await catchError(User.create({
          email: contractorEmail.toLowerCase().trim(),
          role: 'contractor',
          status: 'pending',
          accountRole: 'owner',
        } as any));
        if (createUserError) throw new BadRequestException('Failed to initialize user');

        const [createContractorError, newContractor] = await catchError(Contractor.create({
          user: newUser._id,
          businessEmail: contractorEmail.toLowerCase().trim(),
        } as any));
        if (createContractorError) throw new BadRequestException('Failed to initialize contractor');

        targetContractorId = newContractor._id.toString();
      }
    } else if (contractorId) {
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

      contractorEmailToSend = contractor.businessEmail;
      contractorName = contractor.businessName || contractor.companyName || 'Contractor';
    }

    // Check if contractor has already been invited
    const alreadyInvited = (project.invitations || []).some(
      (inv: any) => inv.contractor.toString() === targetContractorId
    );
    if (alreadyInvited) {
      throw new BadRequestException('This contractor has already been invited to this project');
    }

    // Push a new invitation sub-document into the invitations array
    const invitation = {
      contractor: targetContractorId,
      ...(message && { message }),
      status: 'pending' as const,
      invitedAt: new Date(),
    };

    const [updateError] = await catchError(
      Project.findByIdAndUpdate(projectId, { $push: { invitations: invitation } })
    );

    if (updateError) {
      logError({ message: 'Failed to invite contractor', source: 'ProjectService.inviteToBid', error: updateError });
      throw new BadRequestException('Failed to invite contractor');
    }

    const homeowner = project.homeowner as any;
    const homeownerName = `${homeowner.firstName} ${homeowner.lastName}`;

    const personalMessageBlock = message
      ? `<p><strong>Personal message from ${homeownerName}:</strong></p><blockquote>${message}</blockquote>`
      : '';

    let emailHtml = '';

    if (isNewContractor) {
      emailHtml = `
        <p>Hi,</p>
        <p><strong>${homeownerName}</strong> has invited you to bid on their project: <strong>${project.title}</strong> on RiskFeed.</p>
        ${personalMessageBlock}
        <p>To view the project details and submit your proposal, please start by registering your contractor account.</p>
        <p><a href="${process.env.FRONTEND_URL}/signup/contractor">Click here to register</a></p>
        <p>Best regards,<br>The RiskFeed Team</p>
      `;
    } else {
      emailHtml = `
        <p>Hi ${contractorName},</p>
        <p><strong>${homeownerName}</strong> has invited you to bid on their project: <strong>${project.title}</strong>.</p>
        ${personalMessageBlock}
        <p>Please login to your RiskFeed account to view the project details and submit your proposal and quotation.</p>
        <p>Best regards,<br>The RiskFeed Team</p>
      `;
    }

    if (contractorEmailToSend) {
      await addEmailJob({
        email: contractorEmailToSend,
        subject: `Invitation to Bid: ${project.title}`,
        html: emailHtml,
      });
    }

    logInfo({ message: 'Contractor invited to bid', source: 'ProjectService.inviteToBid', additionalData: { projectId, userId, contractorId: targetContractorId, hasMessage: !!message } });

    return { 
      success: true, 
      data: invitation,
      message: 'Contractor invited to bid successfully' 
    };
  }
  async getOpportunities(userId: string, filters: GetOpportunitiesDto) {
    if (!Validate.mongoId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const [contractorError, contractor] = await catchError(
      Contractor.findOne({ user: userId }).lean()
    );

    if (contractorError) {
      logError({ message: 'Failed to fetch contractor profile', source: 'ProjectService.getOpportunities', error: contractorError });
      throw new BadRequestException('Failed to fetch contractor profile');
    }

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    const query: any = {
      status: 'published',
      selectedContractor: { $exists: false },
    };

    if (filters.projectType) {
      query.projectType = filters.projectType;
    }

    const page = filters.page || 1;
    const limit = filters.limit || CONFIG.settings.PAGINATION_LIMIT;
    const skip = (page - 1) * limit;

    const [projectsError, projects] = await catchError(
      Project.find(query)
        .populate('homeowner', 'firstName lastName email profilePicture')
        .populate('property')
        .lean()
    );

    if (projectsError) {
      logError({ message: 'Failed to fetch projects', source: 'ProjectService.getOpportunities', error: projectsError });
      throw new BadRequestException('Failed to fetch projects');
    }

    const evaluatedProjects = projects.map(project => {
      const property = project.property as any;
      const projectCity = property?.address?.city;
      const projectState = property?.address?.state;
      const projectType = project.projectType;
      const isInvited = (project.invitations || []).some((inv: any) => inv.contractor.toString() === contractor._id.toString());

      let matchPercentage = 50;
      let riskFactor = 100;

      if (contractor.services?.includes(projectType)) {
        matchPercentage += 0;
      } else {
        matchPercentage = 0;
      }

      if (matchPercentage > 0) {
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
        }

        matchPercentage = Math.min(matchPercentage, 100);

        const isFullyVerified = 
          contractor.verification?.businessVerificationStatus === 'verified' &&
          contractor.verification?.licenseValidationStatus === 'verified' &&
          contractor.verification?.insuranceCheckStatus === 'verified' &&
          contractor.verification?.backgroundScreeningStatus === 'verified' &&
          contractor.verification?.financialHealthStatus === 'verified';

        if (isFullyVerified) riskFactor -= 40;
        if (contractor.yearEstablished && (new Date().getFullYear() - contractor.yearEstablished) > 3) riskFactor -= 20;
        if (contractor.isBonded) riskFactor -= 20;
        
        const now = new Date();
        if (contractor.insurance?.expiryDate && new Date(contractor.insurance.expiryDate) > now) {
          riskFactor -= 20;
        }

        riskFactor = Math.max(riskFactor, 0);
      }

      return {
        ...project,
        matchPercentage,
        riskFactor,
        isInvited,
      };
    });

    let filteredProjects = evaluatedProjects.filter(p => p.matchPercentage > 0);

    if (filters.minMatchPercentage !== undefined) {
      const minMatch = filters.minMatchPercentage;
      filteredProjects = filteredProjects.filter(p => p.matchPercentage >= minMatch);
    }

    if (filters.maxMatchPercentage !== undefined) {
      const maxMatch = filters.maxMatchPercentage;
      filteredProjects = filteredProjects.filter(p => p.matchPercentage <= maxMatch);
    }

    if (filters.propertyState) {
      const state = filters.propertyState;
      filteredProjects = filteredProjects.filter(p => {
        const property = p.property as any;
        return property?.address?.state?.toLowerCase() === state.toLowerCase();
      });
    }

    if (filters.propertyType) {
      filteredProjects = filteredProjects.filter(p => {
        const property = p.property as any;
        return property?.propertyType === filters.propertyType;
      });
    }

    filteredProjects.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.riskFactor - b.riskFactor;
    });

    const total = filteredProjects.length;
    const paginatedProjects = filteredProjects.slice(skip, skip + limit);

    logInfo({ message: 'Fetched opportunities for contractor', source: 'ProjectService.getOpportunities', additionalData: { userId, contractorId: contractor._id, total } });

    return {
      success: true,
      data: {
        items: paginatedProjects,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
      message: 'Opportunities fetched successfully',
    };
  }
}
