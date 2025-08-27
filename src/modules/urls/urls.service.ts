import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { Request, Response } from 'express';
import { Url } from '../../typeorm/entity/Url';
import { nanoid } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/entity/User';
import { DecodedJWT } from '../../common/types';
import { Access } from '../../typeorm/entity/Access';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepo: Repository<Url>,
    @InjectRepository(Access)
    private readonly accessRepo: Repository<Access>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async shorten(dto: CreateUrlDto, req: Request, user: DecodedJWT) {
    const u = new Url();
    const { id } = user;
    const User = await this.userRepo.findOneBy({ id });

    const { customID, customPrefix, url, expiresAt } = dto;
    const host = `${req.protocol}://${req.get('host')}`;
    let p = customPrefix ? customPrefix : 'e';
    let i = customID ? customID : nanoid(8);

    u.user = User;
    u.id = `${p}.${i}`;
    u.original = url;
    u.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    u.publishedBy = user.id;

    await this.urlRepo.save(u);
    return `${host}/u/${u.id}`;
  }

  async redirect(id: string, res: Response) {
    const url = await this.urlRepo.findOneBy({ id });
    if (!url) throw new NotFoundException('Original URL Not Found');
    return res.redirect(url.original);
  }

  async getAllFromUser(id: string) {
    const user = await this.urlRepo.findOne({where: {id }  }, )
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    console.log("user")
    return user;
  }

  async delete(id: string, user: DecodedJWT) {
    const urlToDelete = await this.urlRepo.findOneBy({ id });
    if (!user || user.id === 'anon')
      throw new UnauthorizedException(
        'In Order to Delete a URL, You Must Be Logged In',
      );

    if (!urlToDelete) throw new NotFoundException('URL Doesnt exist');
    if (user.id !== urlToDelete.publishedBy)
      throw new ForbiddenException('You Can Only Delete Your Own URLs');

    await this.urlRepo.remove(urlToDelete);

    return { message: 'URL Deleted.' };
  }

  async registerAccess(id: string, ip: string) {
    const url = await this.urlRepo.findOneByOrFail({ id });
    const when = new Date();
    const access = this.accessRepo.create({ url, ip, when });
    await this.accessRepo.save(access);
  }
}
