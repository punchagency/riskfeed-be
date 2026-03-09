import { Module } from '@nestjs/common';
import { ContractorService } from './contractor.service';
import { ContractorController } from './contractor.controller';

@Module({
  controllers: [ContractorController],
  providers: [ContractorService],
})
export class ContractorModule {}
