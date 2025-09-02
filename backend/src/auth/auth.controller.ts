import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { issueCsrfToken } from './csrf.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    const secret = this.config.get<string>('JWT_SECRET') || 'dev-secret';
    const csrf = issueCsrfToken(secret, (JSON.parse(Buffer.from(result.token.split('.')[1], 'base64').toString()) as any).sub);
    res.cookie('csrf', csrf, { httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
    return { token: result.token, csrf };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    const secret = this.config.get<string>('JWT_SECRET') || 'dev-secret';
    const csrf = issueCsrfToken(secret, (JSON.parse(Buffer.from(result.token.split('.')[1], 'base64').toString()) as any).sub);
    res.cookie('csrf', csrf, { httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
    return { token: result.token, csrf };
  }
}
