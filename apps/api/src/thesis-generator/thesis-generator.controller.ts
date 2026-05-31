import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThesisGeneratorService } from './thesis-generator.service';
import { GenerateThesisDto } from './dto/generate-thesis.dto';

@Controller('thesis-generator')
@UseGuards(JwtAuthGuard)
export class ThesisGeneratorController {
  constructor(
    private service: ThesisGeneratorService,
    @InjectQueue('thesis-generator') private queue: Queue,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generate(@Body() dto: GenerateThesisDto, @Req() req: any) {
    const job = await this.queue.add('generate', {
      dto: JSON.stringify(dto),
      userId: req.user.id,
    });
    return { jobId: job.id, message: 'Generación iniciada' };
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.service.getStatus(id);
  }

  @Get(':id/download/:format')
  async download(@Param('id') id: string, @Param('format') format: 'pdf' | 'docx') {
    const url = await this.service.getDownloadUrl(id, format);
    return { url };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async generateSync(@Body() dto: GenerateThesisDto, @Req() req: any) {
    const id = await this.service.generate(dto, req.user.id);
    const status = await this.service.getStatus(id);
    const downloadUrls: Record<string, string> = {};
    for (const fmt of dto.outputFormats ?? ['PDF']) {
      try {
        downloadUrls[fmt.toLowerCase()] = await this.service.getDownloadUrl(id, fmt.toLowerCase() as 'pdf' | 'docx');
      } catch {}
    }
    return { id, status, downloadUrls };
  }
}
