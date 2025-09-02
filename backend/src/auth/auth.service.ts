import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: CreateUserDto) {
    const exists = await this.userModel.exists({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const slug = dto.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    const user = await this.userModel.create({ email: dto.email, passwordHash, slug });
    const token = this.jwtService.sign({ sub: String((user as any)._id), email: user.email });
    return { token };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).select('+passwordHash');
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({ sub: String((user as any)._id), email: user.email });
    return { token };
  }
}
