import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ConversationArchive, ConversationArchiveSchema } from './schemas/conversation-archive.schema';
import { SecurityModule } from '../security/security.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ConversationArchive.name, schema: ConversationArchiveSchema },
    ]),
    SecurityModule,
    AuthModule,
    NotificationsModule,
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
