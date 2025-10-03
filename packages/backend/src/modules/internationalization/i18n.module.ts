import { Module } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { I18nController } from './i18n.controller';
import { TranslationService } from './services/translation.service';
import { LocaleService } from './services/locale.service';

@Module({
  providers: [I18nService, TranslationService, LocaleService],
  controllers: [I18nController],
  exports: [I18nService, TranslationService, LocaleService],
})
export class I18nModule {}
