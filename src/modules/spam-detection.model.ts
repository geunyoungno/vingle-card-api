import { SpamDetectionService } from '#services/spam-detection.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  // controllers: [],
  providers: [SpamDetectionService],
})
export class SpamDetectionModule {}
