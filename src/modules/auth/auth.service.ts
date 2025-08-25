import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/entity/User';
import { CookieService } from './tools/cookie.service';
import { HashService } from './tools/hash.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DecodedJWT } from '../../common/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cookieService: CookieService,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
  ) {}

  async registerUser(res: Response, dto: RegisterUserDto) {
    const userExists = await this.userRepo.findOneBy({ email: dto.email });
    if (userExists) throw new ConflictException('Email already registered');

    const hashedPass = this.hashService.hash(dto.password);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPass,
    });

    await this.userRepo.save(user);

    const payload = { id: user.id, email: user.email };
    const token = this.jwt.sign(payload);
    this.cookieService.setCookie(res, 'token', token, { maxAge: 3600000 });
    return { message: 'user registered successfully' };
  }

  async login(dto: LoginDto, res: Response) {
    const { email, password } = dto;
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    const isPasswordValid = this.hashService.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = this.jwt.sign(payload);

    this.cookieService.setCookie(res, 'token', token);

    return { message: 'Successfully Logged In' };
  }

  async getCurrent(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User Not Found or Does Not Exist');
    return user;
  }

  refresh(req: Request, res: Response) {
    const token = this.cookieService.getCookie(req, 'token');
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      this.jwt.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  logout(res: Response) {
    this.cookieService.clearCookie(res, 'token');
    return { message: 'Logged out' };
  }

  getTokens(req: Request) {
    return this.cookieService.getCookie(req, 'token');
  }

  identify(req: Request): DecodedJWT {
    const token = this.cookieService.getCookie(req, 'token');
    if (!token) throw new UnauthorizedException('User is Not Logged In');
    const validToken = this.jwt.decode(token);

    return validToken;
  }
}
