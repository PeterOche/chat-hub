import { Injectable } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizerService {
  sanitize(input: string): string {
    const fn: any = (sanitizeHtml as any).default || (sanitizeHtml as any);
    return fn(input, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
    });
  }
}
