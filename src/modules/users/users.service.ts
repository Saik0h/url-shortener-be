import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User';
import { Repository } from 'typeorm';
import { formatDate } from '../../common/helpers';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) { }

  async getOne(id: string) {

    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User Does Not Exist');

    const userWsd = {
      name: user.name,
      memberSince: formatDate(String(user.memberSince)),
    };

    return { user: userWsd };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User Not Found or Does Not Exist');
    await this.userRepo.remove(user);

    const cachedUser = await this.cacheManager.get(id)
    if (cachedUser) await this.cacheManager.del(id)

    return { message: 'User Removed Successfully' };
  }

  async createUser(dto: RegisterUserDto) {
    console.log("dentro de createUser do UserService")
    const user = this.userRepo.create(dto);
    await this.userRepo.save(user);
    return user
  }

  async getByEmail(email: string) {
    const rawUser = await this.userRepo.findOneBy({ email })
    if (!rawUser) throw new UnauthorizedException("User Not Found")
    const { memberSince, name, urls, ...user } = rawUser

    return user
  }

  async getProfile(id: string): Promise<UserProfileDto> {

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['urls', 'urls.accessCount'],
      select: {
        id: true,
        name: true,
        email: true,
        memberSince: true,
        urls: {
          id: true,
          original: true,
          createdAt: true,
          expiresAt: true,
          accessCount: {
            when: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User Not Found or Does Not Exist');

    const urls = user.urls.map(url => ({
      id: url.id!,
      original: url.original,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      accesses: url.accessCount.map(a => ({ when: a.when })),
    }));

    const final = plainToInstance(UserProfileDto, {
      ...user,
      urls
    });


    return final
  }
}
