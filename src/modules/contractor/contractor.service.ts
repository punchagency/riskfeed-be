import { Injectable } from '@nestjs/common';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Injectable()
export class ContractorService {

  findAll() {
    return `This action returns all contractor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contractor`;
  }

  update(id: number, updateContractorDto: UpdateContractorDto) {
    return `This action updates a #${id} contractor`;
  }
}
