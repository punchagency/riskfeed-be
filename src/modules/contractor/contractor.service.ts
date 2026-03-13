import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import Contractor from '@/models/contractor.model';
import { GetContractorsFilterDto } from './dto/get-contractors-filter.dto';
import catchError from '@/utils/catchError';
import { logError } from '@/utils/SystemLogs';
import CONFIG from '@/config/config';

@Injectable()
export class ContractorService {
  async findAll(filterDto: GetContractorsFilterDto) {
    const { search, speciality, location, minRating, maxRiskScore, page = 1, limit = CONFIG.settings.PAGINATION_LIMIT } = filterDto;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }

    if (speciality) {
      query.services = speciality;
    }

    if (location) {
      query.$or = [
        { 'businessAddresses.city': { $regex: location, $options: 'i' } },
        { 'businessAddresses.state': { $regex: location, $options: 'i' } },
        { serviceAreas: { $regex: location, $options: 'i' } },
      ];
    }

    if (minRating !== undefined) {
      query['ratings.averageRatings'] = { $gte: minRating };
    }

    if (maxRiskScore !== undefined) {
      query.riskScore = { $lte: maxRiskScore };
    }

    const [error, result] = await catchError(Promise.all([
      Contractor.find(query).skip(skip).limit(limit).lean(),
      Contractor.countDocuments(query),
    ]));

    if (error) {
      logError({
        message: 'Failed to fetch contractors',
        source: 'ContractorService.findAll',
        error,
        additionalData: { filterDto },
      });
      throw new InternalServerErrorException('Failed to fetch contractors');
    }

    const [items, total] = result;

    return {
      success: true,
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  }
  async findOne(id: string) {
    const [error, contractor] = await catchError(Contractor.findById(id).lean());

    if (error) {
      logError({
        message: 'Failed to find contractor',
        source: 'ContractorService.findOne',
        error,
        additionalData: { id },
      });
      throw new InternalServerErrorException('Error retrieving contractor');
    }

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    return {
      success: true,
      data: contractor,
    };
  }
}
