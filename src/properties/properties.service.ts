import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PropertiesModel, } from '@/models/properties.model';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import catchError from '@/utils/catchError';
import { logError, logInfo } from '@/utils/SystemLogs';
import Validate from '@/utils/Validate';
import CONFIG from '@/config/config';
import fileUploadService from '@/integrations/fileUpload';

@Injectable()
export class PropertiesService {
    async create(userId: string, createPropertyDto: CreatePropertyDto, images?: string[]) {
        const propertyData: any = {
            ...createPropertyDto,
            address: {
                ...(createPropertyDto.address as any),
            },

            user: userId,
            images: images || []
        };

        const [error, property] = await catchError(PropertiesModel.create(propertyData));
        if (error) {
            logError({ message: 'Failed to create property', source: 'PropertiesService.create', error });
            throw new BadRequestException('Failed to create property');
        }

        logInfo({ message: 'Property created', source: 'PropertiesService.create', additionalData: { propertyId: property._id, userId } });
        return { success: true, data: property, message: 'Property created successfully' };
    }

    async findAll({ userId, userRole, page = 1, limit = CONFIG.settings.PAGINATION_LIMIT, search, status, propertyType }: { userId: string, userRole: string, page?: number, limit?: number, search?: string, status?: string, propertyType?: string }) {
        const skip = (page - 1) * limit;
        const query: any = userRole === 'admin' ? {} : { user: userId };

        if (search) query.$text = { $search: search };
        if (status) query.status = status;
        if (propertyType) query.propertyType = propertyType;

        const [error, result] = await catchError(
            Promise.all([
                PropertiesModel.find(query).skip(skip).limit(limit).populate('projects').lean(),
                PropertiesModel.countDocuments(query)
            ])
        );

        if (error) {
            logError({ message: 'Failed to fetch properties', source: 'PropertiesService.findAll', error });
            throw new BadRequestException('Failed to fetch properties');
        }

        const [items, total] = result;
        return {
            success: true,
            data: {
                items,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            }
        };
    }

    async findOne(propertyId: string, userId: string, userRole: string) {
        if (!Validate.mongoId(propertyId)) throw new BadRequestException('Invalid property ID');

        const [error, property] = await catchError(PropertiesModel.findById(propertyId).populate('projects').lean());
        if (error) {
            logError({ message: 'Failed to fetch property', source: 'PropertiesService.findOne', error });
            throw new BadRequestException('Failed to fetch property');
        }

        if (!property) throw new NotFoundException('Property not found');

        if (userRole !== 'admin' && property.user.toString() !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return { success: true, data: property };
    }

    async update(propertyId: string, userId: string, userRole: string, updatePropertyDto: UpdatePropertyDto, newImages?: string[]) {
        if (!Validate.mongoId(propertyId)) throw new BadRequestException('Invalid property ID');

        const [findError, property] = await catchError(PropertiesModel.findById(propertyId));
        if (findError) {
            logError({ message: 'Failed to fetch property', source: 'PropertiesService.update', error: findError });
            throw new BadRequestException('Failed to fetch property');
        }

        if (!property) throw new NotFoundException('Property not found');

        if (userRole !== 'admin' && property.user.toString() !== userId) {
            throw new ForbiddenException('Access denied');
        }

        const { imagesToRemove, address, ...updateData } = updatePropertyDto;

        if (address) {
            property.address = { ...property.address, ...address };
        }

        Object.assign(property, updateData);

        if (imagesToRemove?.length) {
            property.images = property.images?.filter(img => !imagesToRemove.includes(img)) || [];
            await Promise.all(imagesToRemove.map(img => {
                const key = img.split('.com/')[1];
                return key ? fileUploadService.deleteFile(key) : Promise.resolve();
            }));
        }

        if (newImages?.length) {
            property.images = [...(property.images || []), ...newImages];
        }

        const [saveError] = await catchError(property.save());
        if (saveError) {
            logError({ message: 'Failed to update property', source: 'PropertiesService.update', error: saveError });
            throw new BadRequestException('Failed to update property');
        }

        logInfo({ message: 'Property updated', source: 'PropertiesService.update', additionalData: { propertyId, userId } });
        return { success: true, data: property, message: 'Property updated successfully' };
    }

    async remove(propertyId: string, userId: string, userRole: string) {
        if (!Validate.mongoId(propertyId)) throw new BadRequestException('Invalid property ID');

        const [findError, property] = await catchError(PropertiesModel.findById(propertyId).lean());
        if (findError) {
            logError({ message: 'Failed to fetch property', source: 'PropertiesService.remove', error: findError });
            throw new BadRequestException('Failed to fetch property');
        }

        if (!property) throw new NotFoundException('Property not found');

        if (userRole !== 'admin' && property.user.toString() !== userId) {
            throw new ForbiddenException('Access denied');
        }

        if (property.images?.length) {
            await Promise.all(property.images.map(img => {
                const key = img.split('.com/')[1];
                return key ? fileUploadService.deleteFile(key) : Promise.resolve();
            }));
        }

        const [deleteError] = await catchError(PropertiesModel.findByIdAndDelete(propertyId));
        if (deleteError) {
            logError({ message: 'Failed to delete property', source: 'PropertiesService.remove', error: deleteError });
            throw new BadRequestException('Failed to delete property');
        }

        logInfo({ message: 'Property deleted', source: 'PropertiesService.remove', additionalData: { propertyId, userId } });
        return { success: true, message: 'Property deleted successfully' };
    }

    async getAnalytics(userId: string, userRole: string) {
        const match = userRole === 'admin' ? {} : { user: new Types.ObjectId(userId) };

        const [error, analytics] = await catchError(PropertiesModel.aggregate([
            { $match: match },
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalPortfolioValue: { $sum: { $ifNull: ["$currentEstimatedValue", 0] } },
                                totalProperties: { $count: {} },
                                totalAnnualCosts: {
                                    $sum: {
                                        $add: [
                                            { $ifNull: ["$annualPropertyTax", 0] },
                                            { $ifNull: ["$annualInsurance", 0] },
                                            { $ifNull: ["$annualMaintenanceCosts", 0] }
                                        ]
                                    }
                                },
                                totalPurchasePrice: { $sum: { $ifNull: ["$purchasePrice", 0] } }
                            }
                        }
                    ],
                    distributionByType: [
                        {
                            $group: {
                                _id: "$propertyType",
                                count: { $count: {} },
                                totalValue: { $sum: { $ifNull: ["$currentEstimatedValue", 0] } }
                            }
                        },
                        { $sort: { totalValue: -1 } }
                    ],
                    valueProgression: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: { $ifNull: ["$purchaseDate", "$createdAt"] } },
                                    month: { $month: { $ifNull: ["$purchaseDate", "$createdAt"] } }
                                },
                                addedValue: { $sum: { $ifNull: ["$currentEstimatedValue", 0] } }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1 } }
                    ],
                    activeProjects: [
                        { $lookup: { from: 'projects', localField: 'projects', foreignField: '_id', as: 'projectDetails' } },
                        { $unwind: { path: "$projectDetails", preserveNullAndEmptyArrays: true } },
                        {
                            $match: {
                                "projectDetails.status": { $in: ["published", "in_progress"] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                activeProjectsCount: { $count: {} }
                            }
                        }
                    ]
                }
            }
        ]));

        if (error) {
            logError({ message: 'Failed to fetch analytics', source: 'PropertiesService.getAnalytics', error });
            throw new BadRequestException('Failed to fetch analytics');
        }

        const stats = analytics[0].totalStats[0] || { totalPortfolioValue: 0, totalProperties: 0, totalAnnualCosts: 0, totalPurchasePrice: 0 };
        const activeProjectsCount = analytics[0].activeProjects[0]?.activeProjectsCount || 0;

        // Process progression into cumulative value
        let cumulativeValue = 0;
        const progression = analytics[0].valueProgression.map((p: any) => {
            cumulativeValue += p.addedValue;
            return {
                date: `${p._id.year}-${String(p._id.month).padStart(2, '0')}`,
                value: cumulativeValue
            };
        });

        return {
            success: true,
            data: {
                portfolioValue: {
                    total: stats.totalPortfolioValue,
                    progression
                },
                propertySummary: {
                    totalProperties: stats.totalProperties,
                    activeProjectsCount: activeProjectsCount
                },
                distributionByType: analytics[0].distributionByType.map((d: any) => ({
                    type: d._id,
                    count: d.count,
                    value: d.totalValue
                })),
                financialHealth: {
                    totalAnnualCosts: stats.totalAnnualCosts,
                    totalEquity: stats.totalPortfolioValue - stats.totalPurchasePrice
                }
            }
        };
    }
}
