import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async notifyReviewComplete(_advanceId: string) {
    return;
  }
}
