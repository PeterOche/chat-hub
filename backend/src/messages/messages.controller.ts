import { Body, Controller, Get, Param, Post, Query, Res, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { VisitorReplyDto } from './dto/visitor-reply.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ManagerReplyDto } from './dto/manager-reply.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':slug')
  @UseGuards(ThrottlerGuard)
  async sendMessage(
    @Param('slug') slug: string,
    @Body() dto: SendMessageDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.messagesService.addMessage(slug, dto);
    res.cookie('visitorId', result.visitorId, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    const resumeToken = this.messagesService.signResumeToken(slug, result.convoId);
    const resumeUrl = `/${slug}/thread/${result.convoId}?token=${resumeToken}`;
    return { message: 'Message sent', convoId: result.convoId, resumeUrl };
  }

  @Get(':slug/thread/:convoId')
  async getVisitorThread(
    @Param('slug') slug: string,
    @Param('convoId') convoId: string,
    @Query('token') token: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: Request,
  ) {
    const visitorId = (req.cookies as any)?.visitorId as string | undefined;
    const parsedCursor = cursor !== undefined ? parseInt(cursor, 10) : undefined;
    const parsedLimit = limit !== undefined ? parseInt(limit, 10) : 50;
    return this.messagesService.getVisitorThread(slug, convoId, token, visitorId, parsedCursor, parsedLimit);
  }

  @Post(':slug/thread/:convoId/reply')
  @UseGuards(ThrottlerGuard)
  async postVisitorReply(
    @Param('slug') slug: string,
    @Param('convoId') convoId: string,
    @Body() dto: VisitorReplyDto,
    @Req() req: Request,
  ) {
    const visitorId = (req.cookies as any)?.visitorId as string | undefined;
    return this.messagesService.addVisitorReply(slug, convoId, dto.content, dto.token, visitorId);
  }

  // Manager endpoints (protect with JWT later)
  @Post('archive/:userId/:convoId')
  async archive(@Param('userId') userId: string, @Param('convoId') convoId: string) {
    return this.messagesService.archiveConversation(userId, convoId);
  }

  @Get('archive/:userId/:convoId')
  async getArchive(@Param('userId') userId: string, @Param('convoId') convoId: string) {
    return this.messagesService.getArchivedConversation(userId, convoId);
  }

  // Manager-protected endpoints
  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async listConversations(@Req() req: any, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.messagesService.listManagerConversations(req.user.userId, cursor, limit ? parseInt(limit, 10) : 20);
  }

  @Get('conversations/:convoId')
  @UseGuards(JwtAuthGuard)
  async getConversation(@Req() req: any, @Param('convoId') convoId: string, @Query('offset') offset?: string, @Query('limit') limit?: string) {
    return this.messagesService.getManagerConversation(
      req.user.userId,
      convoId,
      offset ? parseInt(offset, 10) : 0,
      limit ? parseInt(limit, 10) : 100,
    );
  }

  @Post('reply/:convoId')
  @UseGuards(JwtAuthGuard)
  async managerReply(@Req() req: any, @Param('convoId') convoId: string, @Body() dto: ManagerReplyDto) {
    return this.messagesService.replyAsManager(req.user.userId, convoId, dto.content);
  }
}
