import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Subscription } from './schemas/subscription.schema';
import * as webPush from 'web-push';

export interface PushProvider {
  send(userId: string, payload: { title: string; body: string; url?: string }): Promise<void>;
}

@Injectable()
export class NotificationsService implements PushProvider {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly enabled: boolean;

  constructor(
    @InjectModel(Subscription.name) private readonly subModel: Model<Subscription>,
    private readonly config: ConfigService,
  ) {
    const subject = this.config.get<string>('PUSH_SUBJECT') || 'mailto:admin@example.com';
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY') || '';
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY') || '';
    this.enabled = Boolean(publicKey && privateKey);
    if (this.enabled) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
    }
  }

  async saveSubscription(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    await this.subModel.updateOne(
      { userId, endpoint: subscription.endpoint },
      { $set: { userId, endpoint: subscription.endpoint, keys: subscription.keys } },
      { upsert: true },
    );
    return { ok: true };
  }

  async send(userId: string, payload: { title: string; body: string; url?: string }) {
    if (!this.enabled) return; // no-op when keys are not configured
    const subs = await this.subModel.find({ userId }).lean();
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webPush.sendNotification({ endpoint: s.endpoint, keys: s.keys } as any, JSON.stringify(payload));
        } catch (err) {
          this.logger.warn(`Push failed for endpoint ${s.endpoint}: ${err?.message || err}`);
        }
      }),
    );
  }
}
