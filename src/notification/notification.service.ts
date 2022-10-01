import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor() {
    firebase.initializeApp();
  }

  async sendNotification(
    title: string,
    body: string,
    token: string,
  ): Promise<void> {

    await firebase.messaging().send({
      notification: {
        title,
        body,
      },
      token,
    });
  }
}
