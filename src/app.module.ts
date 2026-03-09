import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { profilePictureUploadMiddleware } from './integrations/fileUpload';
import { ProposalModule } from './modules/proposal/proposal.module';
import { ProjectModule } from './modules/project/project.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { ContractorModule } from './modules/contractor/contractor.module';

@Module({
  imports: [UserModule, ProposalModule, ProjectModule, PropertiesModule, ContractorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
    consumer
      .apply(profilePictureUploadMiddleware)
      .forRoutes({ path: 'user/register', method: RequestMethod.POST });
  }
}
