import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
