import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { registrationUploadMiddleware, companyLogoUploadMiddleware } from './integrations/fileUpload';
import { ParseFormDataMiddleware } from './middleware/parse-form-data.middleware';
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
      .apply(registrationUploadMiddleware, ParseFormDataMiddleware)
      .forRoutes({ path: 'user/register', method: RequestMethod.POST });
    consumer
      .apply(companyLogoUploadMiddleware, ParseFormDataMiddleware)
      .forRoutes({ path: 'user/profile', method: RequestMethod.PATCH });
  }
}
