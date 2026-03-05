import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Roles } from '@/auth/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileUploadService } from '@/integrations/fileUpload';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles('user')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'propertyImages', maxCount: 10 },
    { name: 'propertyDocuments', maxCount: 10 },
  ], fileUploadService.getMulterOptions()))

  create(@Req() req, @Body() createProjectDto: CreateProjectDto, @UploadedFiles() files: { propertyImages?: any[]; propertyDocuments?: any[] }) {
    return this.projectService.create(req.user._id, createProjectDto, files);
  }

  @Get()
  findAll(
    @Req() req,
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

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.projectService.findOne(id, req.user._id, req.user.role);
  }

  @Patch(':id')
  @Roles('user')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'propertyImages', maxCount: 10 },
    { name: 'propertyDocuments', maxCount: 10 },
  ], fileUploadService.getMulterOptions()))

  update(@Param('id') id: string, @Req() req, @Body() updateProjectDto: UpdateProjectDto, @UploadedFiles() files: { propertyImages?: any[]; propertyDocuments?: any[] }) {
    return this.projectService.update(id, req.user._id, updateProjectDto, files);
  }
}
