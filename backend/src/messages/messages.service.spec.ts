import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { SanitizerService } from '../security/sanitizer/sanitizer.service';

describe('MessagesService', () => {
  let service: MessagesService;
  const userModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  } as any;
  const archiveModel = {
    updateOne: jest.fn(),
    findOne: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: getModelToken('ConversationArchive'), useValue: archiveModel },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token'), verify: jest.fn().mockReturnValue({}) } },
        { provide: SanitizerService, useValue: { sanitize: (s: string) => s } },
      ],
    }).compile();

    service = moduleRef.get(MessagesService);
  });

  it('creates new conversation when none exists', async () => {
    userModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'u1', slug: 'john' }) }),
    });
    // First two attempts (by convoId, by visitorId) return null; third (creation push) returns any truthy
    userModel.findOneAndUpdate
      .mockResolvedValueOnce(null) // by visitor
      .mockResolvedValueOnce({}); // create push returns truthy

    const res = await service.addMessage('john', { content: 'hello' } as any);
    expect(res.convoId).toBeDefined();
    expect(res.visitorId).toBeDefined();
    expect(userModel.findOne).toHaveBeenCalled();
  });

  it('appends to existing conversation by visitorId', async () => {
    userModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'u1', slug: 'john' }) }),
    });
    userModel.findOneAndUpdate
      .mockResolvedValueOnce(null) // by convo skip
      .mockResolvedValueOnce({ conversations: [{ _id: 'c1' }] }); // by visitor

    const res = await service.addMessage('john', { content: 'hello', visitorId: 'v1' } as any);
    expect(res.convoId).toBeDefined();
    expect(userModel.findOneAndUpdate).toHaveBeenCalled();
  });
});


