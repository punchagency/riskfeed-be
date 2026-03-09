import { Controller, Get, Query, Param } from '@nestjs/common';
import { ContractorService } from './contractor.service';
import { GetContractorsFilterDto } from './dto/get-contractors-filter.dto';

@Controller('contractor')
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

  @Get()
  findAll(@Query() filterDto: GetContractorsFilterDto) {
    return this.contractorService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractorService.findOne(id);
  }
}
