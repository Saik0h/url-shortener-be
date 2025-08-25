import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User';
import { Repository } from 'typeorm';
import { formatDate } from '../../common/helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getOne(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User Does Not Exist');

    const userWsd = {
      name: user.name,
      memberSince: formatDate(user.memberSince),
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
    return { message: 'User Removed Successfully' };
  }
}
