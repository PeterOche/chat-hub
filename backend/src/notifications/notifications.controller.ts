import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('subscribe')
  async subscribe(@Body() body: { userId: string; endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.notifications.saveSubscription(body.userId, { endpoint: body.endpoint, keys: body.keys });
  }

  @Post('test')
  async test(@Body() body: { userId: string; title: string; body: string; url?: string }) {
    await this.notifications.send(body.userId, { title: body.title, body: body.body, url: body.url });
    return { ok: true };
  }
}
