import {
  ForbiddenException,
  Inject,
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepo: Repository<Url>,
    @InjectRepository(Access)
    private readonly accessRepo: Repository<Access>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

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
    let original = await this.cacheManager.get<string>(id);

    if (!original) {
      const url = await this.urlRepo.findOneBy({ id });
      if (!url) throw new NotFoundException('Original URL Not Found');
      original = url.original;
      await this.cacheManager.set(id, original, 3600 * 24);
    }

    return res.redirect(original);
  }

  async getAllFromUser(id: string) {
    let urls: Array<Url> = await this.cacheManager.get(id);

    if (!urls) {
      urls = await this.urlRepo.find({ where: { user: { id } } })
      if (urls.length === 0) {
        throw new NotFoundException("User hasn't shortened any urls");
      }
      await this.cacheManager.set(id, urls, 3600 * 24)
    }

    return urls;
  }

  async delete(id: string, user: DecodedJWT) {
    await this.cacheManager.del(id)
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
