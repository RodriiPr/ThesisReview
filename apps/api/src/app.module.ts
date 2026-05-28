import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdvancesModule } from './advances/advances.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FineTuningModule } from './fine-tuning/fine-tuning.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PlagiarismModule } from './plagiarism/plagiarism.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramsModule } from './programs/programs.module';
import { ReferencesModule } from './references/references.module';
import { ReportsModule } from './reports/reports.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { StatsModule } from './stats/stats.module';
import { StorageModule } from './storage/storage.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? (process.env.REDIS_URL as any)
        : {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
          },
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    StorageModule,
    NotificationsModule,
    AuthModule,
    ProgramsModule,
    TemplatesModule,
    AdvancesModule,
    ReviewsModule,
    StatsModule,
    AiAnalysisModule,
    PlagiarismModule,
    ReferencesModule,
    ReportsModule,
    UsersModule,
    FineTuningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
