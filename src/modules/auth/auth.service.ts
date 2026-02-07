import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { CookieService } from './tools/cookie.service';
import { HashService } from './tools/hash.service';
import { JwtService } from '@nestjs/jwt';
import { RequestUser } from '../../common/types';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/entity/User';
import { InjectRepository } from '@nestjs/typeorm';
type JWT_Payload = {
  sub: string;
};
const oneHour = 60000 * 60;
const TOKEN = 'token';
const REFRESH_TOKEN = 'refresh_token';
const REFRESH_TOKEN_COOKIE_EXPIRY = oneHour * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    @Inject() private jwt: JwtService,
    private readonly cookieService: CookieService,
    private readonly hashService: HashService,
    private readonly userService: UsersService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async registerUser(res: Response, dto: RegisterUserDto) {
    const exists = await this.userRepo.findOneBy({ email: dto.email });
    if (!!exists) throw new ConflictException('Email already registered');
    const hashedPass = await this.hashService.hash(dto.password);

    const user = await this.userService.createUser({
      ...dto,
      password: hashedPass,
    });

    const payload: JWT_Payload = { sub: user.id };

    const token = this.jwt.sign(payload, { expiresIn: '5m' });
    const refresh_token = this.jwt.sign(payload, { expiresIn: '7d' });

    user.refreshTokenHash = await this.hashService.hash(refresh_token);
    await this.userRepo.save(user);

    this.cookieService.setCookie(res, TOKEN, token);
    this.cookieService.setCookie(res, REFRESH_TOKEN, refresh_token, {
      maxAge: REFRESH_TOKEN_COOKIE_EXPIRY,
    });
    return { message: 'user registered successfully' };
  }

  async login(dto: LoginDto, res: Response) {
    const { email, password } = dto;
    const user = await this.userService.getByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    const isPasswordValid = await this.hashService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    const payload: JWT_Payload = {
      sub: user.id,
    };

    const token = this.jwt.sign(payload, { expiresIn: '5m' });
    const refresh_token = this.jwt.sign(payload, { expiresIn: '7d' });

    const ufdb = await this.userRepo.findOneBy({ id: user.id });
    ufdb.refreshTokenHash = await this.hashService.hash(refresh_token);
    await this.userRepo.save(ufdb);

    this.cookieService.setCookie(res, TOKEN, token);
    this.cookieService.setCookie(res, REFRESH_TOKEN, refresh_token, {
      maxAge: REFRESH_TOKEN_COOKIE_EXPIRY,
    });

    return { message: 'Successfully Logged In' };
  }

  async refresh(req: Request, res: Response) {
    try {
      const token = this.cookieService.getCookie(req, REFRESH_TOKEN);
      if (!token) throw new UnauthorizedException('No token provided');
      const u = this.jwt.verify<RequestUser>(token);

      const user = await this.userRepo.findOneBy({ id: u.sub });
      console.log(user)
      const valid = await this.hashService.compare(
        token,
        user.refreshTokenHash,
      );
      if (!valid) throw new UnauthorizedException();

      const newAccess = this.jwt.sign({ sub: user.id }, { expiresIn: '5m' });
      const newRefresh = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
      user.refreshTokenHash = await this.hashService.hash(newRefresh);
      await this.userRepo.save(user);

      this.cookieService.setCookie(res, TOKEN, newAccess);
      this.cookieService.setCookie(res, REFRESH_TOKEN, newRefresh, {
        maxAge: REFRESH_TOKEN_COOKIE_EXPIRY,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  async logout(res: Response, id: string) {
    console.log('OI')
    this.cookieService.clearCookie(res, TOKEN);
    this.cookieService.clearCookie(res, REFRESH_TOKEN);
    const user = await this.userRepo.findOneBy({ id });
    user.refreshTokenHash = null;
    await this.userRepo.save(user);
    return { message: 'Logged out' };
  }

  getTokens(req: Request) {
    const access_token = this.cookieService.getCookie(req, TOKEN);
    const refresh_token = this.cookieService.getCookie(req, REFRESH_TOKEN);
    return { access_token, refresh_token };
  }

  identify(req: Request): RequestUser {
    const token = this.cookieService.getCookie(req, TOKEN);
    if (!token) throw new UnauthorizedException('User is Not Logged In');
    const validToken = this.jwt.verify(token);

    return validToken;
  }
}
