import { PrismaClient } from "@prisma/client";

export class NotificationService {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async sendNotification(userId: string, title: string, message: string): Promise<any> {
    console.log(`✉️ [Notification Dispatch] Sending to User ${userId}: [${title}] ${message}`);

    // Persist in-app notification to database
    try {
      const notification = await this.db.notification.create({
        data: {
          userId,
          title,
          message,
          read: false
        }
      });
      return notification;
    } catch (err: any) {
      console.warn("⚠️ Notification database insertion skipped:", err.message);
      return null;
    }
  }

  async notifyAssessmentCompleted(studentId: string, attemptId: string, score: number): Promise<void> {
    await this.sendNotification(
      studentId,
      "AI Assessment Completed",
      `Your attempt at the Interrupted Suture Technique station has been graded. Composite Score: ${score}/100.`
    );
  }

  async notifyManualReviewRequired(facultyId: string, attemptId: string, reason: string): Promise<void> {
    await this.sendNotification(
      facultyId,
      "OSCE Attempt Review Required",
      `A new attempt (${attemptId}) requires manual faculty override validation. Reason: ${reason}`
    );
  }

  async notifyOverrideCompleted(studentId: string, attemptId: string, originalScore: number, newScore: number): Promise<void> {
    await this.sendNotification(
      studentId,
      "Surgical Score Adjusted",
      `A faculty examiner adjusted your attempt score from ${originalScore} to ${newScore}.`
    );
  }
}
