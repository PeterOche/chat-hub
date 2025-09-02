import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  endpoint!: string;

  @Prop({ type: Object, required: true })
  keys!: { p256dh: string; auth: string };
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });
