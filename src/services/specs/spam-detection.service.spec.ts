import { SpamDetectionService } from '#services/spam-detection.service';
import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import 'jest';

describe('SpamDetectionService', () => {
  let spamDetectionService: SpamDetectionService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [SpamDetectionService],
    }).compile();

    spamDetectionService = app.get<SpamDetectionService>(SpamDetectionService);
  });

  describe('isSpam', () => {
    it('isSpam-true', async () => {
      expect(
        await spamDetectionService.isSpam('spam spam https://moiming.page.link/exam?_imcp=1', ['moiming.page.link'], 1),
      ).toEqual(true);

      expect(
        await spamDetectionService.isSpam('spam spam https://moiming.page.link/exam?_imcp=1', ['github.com'], 2),
      ).toEqual(true);

      expect(
        await spamDetectionService.isSpam('spam spam https://moiming.page.link/exam?_imcp=1', ['docs.github.com'], 3),
      ).toEqual(true);
    });

    it('isSpam-false', async () => {
      expect(
        await spamDetectionService.isSpam('spam spam https://moiming.page.link/exam?_imcp=1', ['docs.github.com'], 1),
      ).toEqual(false);

      expect(
        await spamDetectionService.isSpam('spam spam https://moiming.page.link/exam?_imcp=1', ['docs.github.com'], 2),
      ).toEqual(false);
    });
  });
});
