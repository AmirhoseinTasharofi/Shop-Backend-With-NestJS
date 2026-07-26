import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfileInfo(
    userId: number
  ) {
    return await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(
    userId : number , 
    body : UpdateProfileDto
  ){
    if(body.phone){
      const existUser = await this.prismaService.user.findUnique({
            where: {
              phone: body.phone,
            },
          });
          if (existUser?.id !== userId) {
            throw new ConflictException('این شماره موبایل قبلا ثبت شده است');
          }
    }
    return await this.prismaService.user.update({
      where : {
        id : userId
      },
      data : {
        phone : body.phone ,
        firstName : body.firstName ,
        lastName : body.lastName ,
      },
      select : {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }

    });
  }  
  
}
