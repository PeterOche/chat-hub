import { Controller, Get, NotFoundException, Param, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CsrfGuard } from '../auth/csrf.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const me = await this.usersService.findMeById(req.user.userId)
    return me ?? { bio: '', photoUrl: '', theme: {}, slug: '' }
  }

  @Get(':slug')
  async getPublicProfile(@Param('slug') slug: string) {
    const user = await this.usersService.findPublicBySlug(slug);
    if (!user) throw new NotFoundException();
    return { bio: user.bio, photoUrl: user.photoUrl, theme: user.theme, slug: user.slug };
  }
}

