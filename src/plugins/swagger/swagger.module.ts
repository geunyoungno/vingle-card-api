import { SwaggerService } from '#plugins/swagger/swagger.service';
import { Module } from '@nestjs/common';
import swaggerConfiguration, { swaggerOptions } from './swagger.configuration';

@Module({
  providers: [
    {
      provide: SwaggerService,
      useValue: new SwaggerService(swaggerConfiguration(), swaggerOptions),
    },
  ],
})
export class SwaggerModule {}
