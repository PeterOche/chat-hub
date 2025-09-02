import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findPublicBySlug(slug: string) {
    return this.userModel.findOne({ slug }).select({ email: 0, passwordHash: 0 }).lean();
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.userModel.updateOne({ _id: userId }, { $set: dto });
    return { ok: true };
  }

  async findMeById(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select({ bio: 1, photoUrl: 1, theme: 1, slug: 1, _id: 0 })
      .lean();

    if (!user) return null;

    return {
      bio: user.bio ?? '',
      photoUrl: user.photoUrl ?? '',
      theme: (user.theme as Record<string, string>) ?? {},
      slug: user.slug,
    } as { bio: string; photoUrl: string; theme: Record<string, string>; slug: string };
  }
}

