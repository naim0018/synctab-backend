import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AppGateway } from './app.gateway';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [],
  controllers: [AppController, ChatController],
  providers: [AppService, PrismaService, AppGateway, ChatGateway, ChatService],
})
export class AppModule {}
