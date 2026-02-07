import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User';
import { Repository } from 'typeorm';
import { formatDate } from '../../common/helpers';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HashService } from '../auth/tools/hash.service';
import { RequestUser } from '../../common/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject() private hashService: HashService,
  ) {}

  async getOne(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User Does Not Exist');

    const userWsd = {
      id: user.id,
      name: user.name,
      refresh_token: user.refreshTokenHash,
      memberSince: formatDate(String(user.memberSince)),
    };

    return { ...userWsd };
  }

  async getUserRefreshToken() {}

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepo.update({ id }, updateUserDto);

    if (result.affected === 0) {
      throw new NotFoundException();
    }

    return { message: 'User updated successfully' };
  }

  async remove(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User Not Found or Does Not Exist');
    await this.userRepo.remove(user);

    return { message: 'User Removed Successfully' };
  }

  async createUser(dto: RegisterUserDto) {
    const user = this.userRepo.create(dto);
    await this.userRepo.save(user);
    return user;
  }

  async getByEmail(email: string) {
    const rawUser = await this.userRepo.findOneBy({ email });
    if (!rawUser) throw new UnauthorizedException('User Not Found');
    const { memberSince, name, urls, ...user } = rawUser;

    return user;
  }

  async verifyEmail(email: string): Promise<void> {
    const user = await this.userRepo.findOneBy({ email });
    if (user) throw new ConflictException('Email already registered');
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
          accessCount: true,
        },
      },
    });

    if (!user) throw new NotFoundException('User Not Found or Does Not Exist');

    const urls = user.urls.map((url) => ({
      id: url.id!,
      original: url.original,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      accesses: url.accessCount.map((a) => ({ when: a.when })),
    }));

    const final = plainToInstance(UserProfileDto, {
      ...user,
      urls,
    });
    return final;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (await this.hashService.compare(newPassword, user.password)) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    if (!user) {
      throw new NotFoundException();
    }

    const isValid = await this.hashService.compare(
      currentPassword,
      user.password,
    );

    if (!isValid) {
      throw new ForbiddenException('Invalid password');
    }

    user.password = await this.hashService.hash(newPassword);

    await this.userRepo.save(user);

    return { message: 'Password updated successfully' };
  }
}
