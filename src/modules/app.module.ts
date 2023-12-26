import { AppController } from '#controllers/app.controller';
import { SpamDetectionModule } from '#modules/spam-detection.model';
import { PluginModule } from '#plugins/plugin.module';
import { AppService } from '#services/app.service';
import { Module } from '@nestjs/common';
@Module({
  imports: [
    //
    PluginModule,
    SpamDetectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
