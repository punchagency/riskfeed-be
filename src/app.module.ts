import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { profilePictureUploadMiddleware } from './integrations/fileUpload';
import { ProposalModule } from './proposal/proposal.module';
import { ProjectModule } from './project/project.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [UserModule, ProposalModule, ProjectModule, PropertiesModule],
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
