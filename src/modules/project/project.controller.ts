import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetOpportunitiesDto } from './dto/get-opportunities.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Roles } from '@/auth/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileUploadService } from '@/integrations/fileUpload';
import type AuthenticatedRequest from '@/auth/auth-user.interface';

import { InviteContractorDto } from './dto/invite-contractor.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles('user')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'projectImages', maxCount: 10 },
    { name: 'projectDocuments', maxCount: 10 },
  ], fileUploadService.getMulterOptions()))
  create(@Req() req: AuthenticatedRequest, @Body() createProjectDto: CreateProjectDto, @UploadedFiles() files: { projectImages?: any[]; projectDocuments?: any[] }) {
    return this.projectService.create(req.user._id, createProjectDto, files);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('minBudget') minBudget?: string,
    @Query('maxBudget') maxBudget?: string,
  ) {
    return this.projectService.findAll({
      userId: req.user._id,
      userRole: req.user.role,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : undefined,
      search,
      status,
      riskLevel,
      minBudget: minBudget ? parseFloat(minBudget) : undefined,
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
    });
  }

  @Get('opportunities')
  @Roles('contractor')
  @UseGuards(RolesGuard)
  opportunities(@Req() req: AuthenticatedRequest, @Query() filters: GetOpportunitiesDto) {
    return this.projectService.getOpportunities(req.user._id, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @Roles('user')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'projectImages', maxCount: 10 },
    { name: 'projectDocuments', maxCount: 10 },
  ], fileUploadService.getMulterOptions()))

  update(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Body() updateProjectDto: UpdateProjectDto, @UploadedFiles() files: { projectImages?: any[]; projectDocuments?: any[] }) {
    return this.projectService.update(id, req.user._id, updateProjectDto, files);
  }


  @Get(':id/suggest-contractors')
  @Roles('user')
  @UseGuards(RolesGuard)
  suggestContractorForProject(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.projectService.suggestContractorForProject(id, req.user._id);
  }

  @Post(':id/invite-contractor')
  @Roles('user')
  @UseGuards(RolesGuard)
  inviteContractor(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Body() inviteContractorDto: InviteContractorDto) {
    return this.projectService.inviteToBid({
      projectId: id,
      userId: req.user._id,
      contractorId: inviteContractorDto.contractorId,
      message: inviteContractorDto.message,
      contractorEmail: inviteContractorDto.contractorEmail
    });
  }
}
