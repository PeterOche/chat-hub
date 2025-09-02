import { Module } from '@nestjs/common';
import { SanitizerService } from './sanitizer/sanitizer.service';

@Module({
  providers: [SanitizerService],
  exports: [SanitizerService],
})
export class SecurityModule {}
