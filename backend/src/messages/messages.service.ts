import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConversationArchive } from './schemas/conversation-archive.schema';
import { SanitizerService } from '../security/sanitizer/sanitizer.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(ConversationArchive.name) private readonly archiveModel: Model<ConversationArchive>,
    private readonly jwtService: JwtService,
    private readonly sanitizer: SanitizerService,
    private readonly notifications: NotificationsService,
  ) {}

  async addMessage(slug: string, dto: SendMessageDto) {
    const user = await this.userModel.findOne({ slug }).select({ _id: 1, slug: 1 }).lean();
    if (!user) throw new NotFoundException('Manager not found');

    const clean = this.sanitizer.sanitize(dto.content);
    const message = { sender: 'visitor', content: clean, timestamp: new Date() } as const;
    const visitorId = dto.visitorId || uuidv4();

    const matchByConvo = dto.convoId
      ? { 'conversations._id': new Types.ObjectId(dto.convoId) }
      : null;
    const matchByVisitor = { 'conversations.visitorInfo.visitorId': visitorId };

    const updateExisting = {
      $push: { 'conversations.$.messages': message },
      $set: { 'conversations.$.lastMessageAt': message.timestamp },
      $inc: { 'conversations.$.unreadCount': 1 },
    } as const;

    let updated = null as null | { convoId: string };

    if (matchByConvo) {
      const res = await this.userModel.findOneAndUpdate(
        { _id: user._id, ...matchByConvo },
        updateExisting,
        { new: false, projection: { 'conversations.$': 1 } },
      );
      if (res && res.conversations && (res as any).conversations[0]) {
        updated = { convoId: String((res as any).conversations[0]._id) };
      }
    }

    if (!updated) {
      const res = await this.userModel.findOneAndUpdate(
        { _id: user._id, ...matchByVisitor },
        updateExisting,
        { new: false, projection: { 'conversations.$': 1 } },
      );
      if (res && (res as any).conversations && (res as any).conversations[0]) {
        updated = { convoId: String((res as any).conversations[0]._id) };
      }
    }

    if (updated) {
      // send in-app/web push
      await this.notifications.send(String(user._id), { title: 'New message', body: clean, url: `/dashboard/thread/${updated.convoId}` });
      return { convoId: updated.convoId, visitorId };
    }

    const newConvoId = new Types.ObjectId();
    const createRes = await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          conversations: {
            _id: newConvoId,
            visitorInfo: {
              visitorId,
              name: dto.name || 'Anonymous',
              email: dto.email || '',
            },
            messages: [message],
            archivedAt: null,
            lastMessageAt: message.timestamp,
            unreadCount: 1,
          },
        },
      },
      { new: false },
    );

    if (!createRes) throw new NotFoundException('Manager not found after lookup');
    await this.notifications.send(String(user._id), { title: 'New message', body: clean, url: `/dashboard/thread/${String(newConvoId)}` });
    return { convoId: String(newConvoId), visitorId };
  }

  async archiveConversation(userId: string, convoId: string) {
    const user = await this.userModel.findOne({ _id: userId, 'conversations._id': new Types.ObjectId(convoId) }, { 'conversations.$': 1 });
    if (!user || !user.conversations || !user.conversations[0]) throw new NotFoundException();
    const convo: any = user.conversations[0];
    await this.archiveModel.updateOne(
      { userId: user._id, convoId: convo._id },
      {
        $set: {
          userId: user._id,
          convoId: convo._id,
          visitorInfo: convo.visitorInfo,
          messages: convo.messages,
          archivedAt: new Date(),
          lastMessageAt: convo.lastMessageAt,
        },
      },
      { upsert: true },
    );
    await this.userModel.updateOne(
      { _id: user._id, 'conversations._id': convo._id },
      { $set: { 'conversations.$.archivedAt': new Date() } },
    );
    return { ok: true };
  }

  async getArchivedConversation(userId: string, convoId: string) {
    const archived = await this.archiveModel.findOne({ userId, convoId }).lean();
    if (!archived) throw new NotFoundException();
    return archived;
  }

  signResumeToken(slug: string, convoId: string) {
    return this.jwtService.sign({ slug, convoId }, { expiresIn: '180d' });
  }

  verifyResumeToken(token: string, expectedSlug: string, expectedConvoId: string) {
    try {
      const payload = this.jwtService.verify(token) as { slug: string; convoId: string };
      if (payload.slug !== expectedSlug || payload.convoId !== expectedConvoId) throw new UnauthorizedException();
      return true;
    } catch {
      throw new UnauthorizedException('Invalid resume token');
    }
  }

  async getVisitorThread(slug: string, convoId: string, token: string | undefined, visitorIdFromCookie: string | undefined, cursor?: number, limit: number = 50, before?: string) {
    // Validate token if provided; else require matching visitorId cookie
    if (token) {
      this.verifyResumeToken(token, slug, convoId);
    }
    const user = await this.userModel.findOne({ slug, 'conversations._id': new Types.ObjectId(convoId) }, { 'conversations.$': 1 }).lean();
    if (!user || !user.conversations || !user.conversations[0]) throw new NotFoundException();
    const convo: any = user.conversations[0];
    if (!token && visitorIdFromCookie && convo.visitorInfo?.visitorId !== visitorIdFromCookie) {
      throw new UnauthorizedException('Not your conversation');
    }
    const messages = (convo.messages || []) as Array<{ timestamp: Date }>;
    let filtered = messages;
    if (before) {
      const beforeTs = new Date(before).getTime();
      filtered = messages.filter((m: any) => new Date(m.timestamp).getTime() < beforeTs);
    }
    const start = Math.max(0, (cursor ?? Math.max(filtered.length - limit, 0)));
    const slice = filtered.slice(start, start + limit);
    const nextCursor = start > 0 ? Math.max(start - limit, 0) : null;
    const nextBefore = slice.length ? new Date(slice[0].timestamp).toISOString() : null;
    return { convoId, messages: slice, nextCursor, nextBefore };
  }

  async addVisitorReply(slug: string, convoId: string, content: string, token: string | undefined, visitorIdFromCookie: string | undefined) {
    const clean = this.sanitizer.sanitize(content);
    if (token) this.verifyResumeToken(token, slug, convoId);
    const res = await this.userModel.findOneAndUpdate(
      { slug, 'conversations._id': new Types.ObjectId(convoId) },
      {
        $push: { 'conversations.$.messages': { sender: 'visitor', content: clean, timestamp: new Date() } },
        $set: { 'conversations.$.lastMessageAt': new Date() },
        $inc: { 'conversations.$.unreadCount': 1 },
      },
      { new: false, projection: { 'conversations.$': 1 } },
    );
    if (!res || !res.conversations || !res.conversations[0]) throw new NotFoundException();
    if (!token && visitorIdFromCookie && res.conversations[0].visitorInfo?.visitorId !== visitorIdFromCookie) {
      throw new UnauthorizedException('Not your conversation');
    }
    return { ok: true };
  }

  async listManagerConversations(userId: string, cursor?: string, limit: number = 20) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException();
    const threads = (user as any).conversations || [];
    threads.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    let startIndex = 0;
    if (cursor) {
      const idx = threads.findIndex((t: any) => String(t._id) === cursor);
      startIndex = idx >= 0 ? idx + 1 : 0;
    }
    const page = threads.slice(startIndex, startIndex + limit).map((t: any) => ({
      convoId: String(t._id),
      lastMessageAt: t.lastMessageAt,
      unreadCount: t.unreadCount || 0,
      visitorInfo: t.visitorInfo,
      lastSnippet: (t.messages && t.messages.length ? t.messages[t.messages.length - 1].content : ''),
      archivedAt: t.archivedAt || null,
    }));
    const nextCursor = startIndex + limit < threads.length ? String(page[page.length - 1]._id || page[page.length - 1].convoId) : null;
    return { items: page, nextCursor };
  }

  async getManagerConversation(userId: string, convoId: string, offset: number = 0, limit: number = 100) {
    const user = await this.userModel.findOne({ _id: userId, 'conversations._id': new Types.ObjectId(convoId) }, { 'conversations.$': 1 }).lean();
    if (!user || !user.conversations || !user.conversations[0]) throw new NotFoundException();
    const convo: any = user.conversations[0];
    const messages = convo.messages || [];
    const slice = messages.slice(Math.max(0, messages.length - offset - limit), messages.length - offset);
    return { convoId, messages: slice, visitorInfo: convo.visitorInfo, archivedAt: convo.archivedAt || null };
  }

  async replyAsManager(userId: string, convoId: string, content: string) {
    const clean = this.sanitizer.sanitize(content);
    const res = await this.userModel.findOneAndUpdate(
      { _id: userId, 'conversations._id': new Types.ObjectId(convoId) },
      {
        $push: { 'conversations.$.messages': { sender: 'manager', content: clean, timestamp: new Date() } },
        $set: { 'conversations.$.lastMessageAt': new Date(), 'conversations.$.unreadCount': 0 },
      },
      { new: false, projection: { 'conversations.$': 1 } },
    );
    if (!res || !res.conversations || !res.conversations[0]) throw new NotFoundException();
    return { ok: true };
  }
}
