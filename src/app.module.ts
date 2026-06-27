import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppGateway],
})
export class AppModule {}
