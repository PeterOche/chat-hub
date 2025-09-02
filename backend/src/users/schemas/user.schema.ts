import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ default: '' })
  bio!: string;

  @Prop({ default: '' })
  photoUrl!: string;

  @Prop({ type: Object, default: {} })
  theme!: Record<string, string>;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
        visitorInfo: {
          visitorId: { type: String, required: true },
          name: { type: String, default: '' },
          email: { type: String, default: '' },
        },
        messages: [
          {
            sender: { type: String, enum: ['manager', 'visitor'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
          },
        ],
        archivedAt: { type: Date, default: null },
        lastMessageAt: { type: Date, default: Date.now },
        unreadCount: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  conversations!: any[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ slug: 1 });
UserSchema.index({ 'conversations._id': 1 });
UserSchema.index({ 'conversations.lastMessageAt': -1 });
UserSchema.index({ slug: 1, 'conversations.visitorInfo.visitorId': 1 });
UserSchema.index({ slug: 1, 'conversations._id': 1 });

