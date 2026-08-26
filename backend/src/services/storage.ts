import { promises as fs } from "fs";
import * as path from "path";

export interface VideoStorageService {
  upload(fileName: string, fileBuffer: Buffer): Promise<string>;
  getFilePath(fileName: string): string;
  exists(fileName: string): Promise<boolean>;
  delete(fileName: string): Promise<void>;
}

export class LocalVideoStorageService implements VideoStorageService {
  private uploadDir: string;

  constructor() {
    // Save videos privately inside backend/uploads/videos
    this.uploadDir = path.join(__dirname, "../../uploads/videos");
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (err) {
      console.error("❌ Failed to create upload directory:", err);
    }
  }

  async upload(fileName: string, fileBuffer: Buffer): Promise<string> {
    await this.ensureDirectoryExists();
    // Sanitize the filename to prevent directory traversal
    const safeName = path.basename(fileName);
    const destinationPath = path.join(this.uploadDir, safeName);
    
    await fs.writeFile(destinationPath, fileBuffer);
    return safeName; // Return just the filename as the unique reference
  }

  getFilePath(fileName: string): string {
    const safeName = path.basename(fileName);
    return path.join(this.uploadDir, safeName);
  }

  async exists(fileName: string): Promise<boolean> {
    const safeName = path.basename(fileName);
    const fullPath = path.join(this.uploadDir, safeName);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(fileName: string): Promise<void> {
    const safeName = path.basename(fileName);
    const fullPath = path.join(this.uploadDir, safeName);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.warn(`⚠️ File ${fileName} not found for deletion or failed to delete:`, err);
    }
  }
}

export const videoStorage = new LocalVideoStorageService();
