import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractorService } from './contractor.service';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Controller('contractor')
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}


  @Get()
  findAll() {
    return this.contractorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractorDto: UpdateContractorDto) {
    return this.contractorService.update(+id, updateContractorDto);
  }
}
