import { Controller, Get, NotFoundException, Param, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CsrfGuard } from '../auth/csrf.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':slug')
  async getPublicProfile(@Param('slug') slug: string) {
    const user = await this.usersService.findPublicBySlug(slug);
    if (!user) throw new NotFoundException();
    return { bio: user.bio, photoUrl: user.photoUrl, theme: user.theme, slug: user.slug };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }
}

