import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFiles, UsePipes, ValidationPipe } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import fileUploadService from '@/integrations/fileUpload';
import multer from 'multer';
import type AuthenticatedRequest from '@/auth/auth-user.interface';


@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'propertyImages', maxCount: 10 }], fileUploadService.getMulterOptions()))
    async create(
        @Req() req: AuthenticatedRequest,
        @Body() createPropertyDto: CreatePropertyDto,
        @UploadedFiles() files: { propertyImages?: multer[] }
    ) {
        const images = files?.propertyImages?.map(file => file.location) || [];
        return this.propertiesService.create(req.user._id.toString(), createPropertyDto, images);
    }

    @Get('analytics')
    async getAnalytics(@Req() req: AuthenticatedRequest) {
        return this.propertiesService.getAnalytics(req.user._id.toString(), req.user.role);
    }

    @Get()
    findAll(
        @Req() req: AuthenticatedRequest,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('propertyType') propertyType?: string,
        @Query('lite') lite?: boolean
    ) {
        return this.propertiesService.findAll({
            userId: req.user._id.toString(),
            userRole: req.user.role,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : undefined,
            search,
            status,
            propertyType,
            lite
        });
    }

    @Get(':id')
    findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.propertiesService.findOne(id, req.user._id.toString(), req.user.role);
    }

    @Patch(':id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'propertyImages', maxCount: 10 }], fileUploadService.getMulterOptions()))
    update(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @UploadedFiles() files: { propertyImages?: multer[] }
    ) {
        const newImages = files?.propertyImages?.map(file => file.location) || [];
        return this.propertiesService.update(id, req.user._id.toString(), req.user.role, updatePropertyDto, newImages);
    }

    @Delete(':id')
    remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.propertiesService.remove(id, req.user._id.toString(), req.user.role);
    }
}
