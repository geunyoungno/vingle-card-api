import { HttpExceptionFilter } from '#plugins/filter/http-exception.filter';
import { SwaggerModule } from '#plugins/swagger/swagger.module';
import { Module, Scope } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [SwaggerModule],
  providers: [
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class PluginModule {}
