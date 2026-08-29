import { PrismaClient } from "@prisma/client";

export interface LTILaunchPayload {
  iss: string;
  sub: string; // Student/User identifier in LMS
  aud: string;
  deploymentId: string;
  context: {
    id: string;
    label: string;
    title: string;
  };
  roles: string[];
  custom?: {
    lis_person_name_full?: string;
    lis_person_contact_email_primary?: string;
  };
}

export interface LMSIntegrationProvider {
  validateLaunchToken(jwtToken: string): Promise<LTILaunchPayload>;
  passbackGrade(attemptId: string, score: number): Promise<boolean>;
}

export class LTI13IntegrationProvider implements LMSIntegrationProvider {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async validateLaunchToken(jwtToken: string): Promise<LTILaunchPayload> {
    // Standard LTI 1.3 Launch validation boundary
    // In production, this validates JWT signatures, Issuer matching, Nonces, and client IDs.
    // LTI PRODUCTION INTEGRATION — NOT COMPLETE (Key configuration required in production).
    
    if (!jwtToken) {
      throw new Error("LTI launch token is empty.");
    }

    // Return structured payload for mapping if validation checks out
    return {
      iss: "https://canvas.instructure.com",
      sub: "lms_user_student_101",
      aud: "surgiskill_client_id",
      deploymentId: "dep_998",
      context: {
        id: "canvas_course_12",
        label: "SURG-301",
        title: "Advanced OSCE Residency Prep"
      },
      roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
      custom: {
        lis_person_name_full: "LMS Suture Student",
        lis_person_contact_email_primary: "lms.student@residency.edu"
      }
    };
  }

  async passbackGrade(attemptId: string, score: number): Promise<boolean> {
    console.log(`📡 [LMS LTI Grade Passback] Syncing score ${score} for Attempt ${attemptId}`);
    // Stub endpoint representing standard grade payload transport.
    return true;
  }
}
