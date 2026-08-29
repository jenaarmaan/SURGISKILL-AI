export interface QueueJob {
  id: string;
  attemptId: string;
  filePath: string;
  simulateFailure: boolean;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  retryCount: number;
}

export interface QueueProvider {
  enqueue(attemptId: string, filePath: string, simulateFailure?: boolean): Promise<void>;
  isProcessing(attemptId: string): boolean;
  clean(): Promise<void>;
}
