import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ConversationArchive extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  convoId!: Types.ObjectId;

  @Prop({ type: Object, required: true })
  visitorInfo!: { visitorId: string; name?: string; email?: string };

  @Prop({ type: Array, default: [] })
  messages!: { sender: 'manager' | 'visitor'; content: string; timestamp: Date }[];

  @Prop({ type: Date, required: true })
  archivedAt!: Date;

  @Prop({ type: Date, required: true })
  lastMessageAt!: Date;
}

export const ConversationArchiveSchema = SchemaFactory.createForClass(ConversationArchive);

ConversationArchiveSchema.index({ userId: 1, convoId: 1 }, { unique: true });
ConversationArchiveSchema.index({ archivedAt: -1 });
