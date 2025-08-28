import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { CookieService } from './tools/cookie.service';
import { HashService } from './tools/hash.service';
import { JwtService } from '@nestjs/jwt';
import { DecodedJWT } from '../../common/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private jwt: JwtService,
    private readonly cookieService: CookieService,
    private readonly hashService: HashService,
    private readonly userService: UsersService,
  ) { }

  async registerUser(res: Response, dto: RegisterUserDto) {
    const userExists = await this.userService.getByEmail(dto.email);
    if (userExists) throw new ConflictException('Email already registered');
    console.log("Dentro de register user do auth")
    const hashedPass = this.hashService.hash(dto.password);

    const user = await this.userService.createUser({
      ...dto,
      password: hashedPass,
    });
    console.log("Dentro de register user do auth, usuario criado")


    const payload = { id: user.id, email: user.email };
    const token = this.jwt.sign(payload);
    this.cookieService.setCookie(res, 'token', token, { maxAge: 3600000 });
    return { message: 'user registered successfully' };
  }

  async login(dto: LoginDto, res: Response) {
    const { email, password } = dto;
    const user = await this.userService.getByEmail(email);
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
