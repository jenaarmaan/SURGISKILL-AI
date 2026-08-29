import { promises as fs, createReadStream } from "fs";
import * as path from "path";
import { Readable } from "stream";
import { VideoStorageProvider } from "./storage-interface";

export class LocalVideoStorageProvider implements VideoStorageProvider {
  private uploadDir: string;

  constructor() {
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
    const safeName = path.basename(fileName);
    const destinationPath = path.join(this.uploadDir, safeName);
    
    await fs.writeFile(destinationPath, fileBuffer);
    return safeName;
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

  async getReadStream(fileName: string): Promise<Readable> {
    const safeName = path.basename(fileName);
    const fullPath = path.join(this.uploadDir, safeName);
    return createReadStream(fullPath);
  }

  // Backwards compatibility helper
  getFilePath(fileName: string): string {
    const safeName = path.basename(fileName);
    return path.join(this.uploadDir, safeName);
  }
}

export class ObjectStorageProvider implements VideoStorageProvider {
  private s3: any;
  private bucketName: string;

  constructor() {
    const { S3Client } = require("@aws-sdk/client-s3");
    
    this.bucketName = process.env.S3_BUCKET_NAME || "";
    if (!this.bucketName) {
      throw new Error("S3_BUCKET_NAME is missing in storage configuration.");
    }

    const config: any = {
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      }
    };

    if (process.env.S3_ENDPOINT) {
      config.endpoint = process.env.S3_ENDPOINT;
      config.forcePathStyle = true; // Required for custom S3 endpoints like MinIO or LocalStack
    }

    this.s3 = new S3Client(config);
  }

  async upload(fileName: string, fileBuffer: Buffer): Promise<string> {
    const { PutObjectCommand } = require("@aws-sdk/client-s3");
    const safeName = path.basename(fileName);

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: safeName,
      Body: fileBuffer,
      ContentType: "video/mp4"
    }));

    return safeName;
  }

  async exists(fileName: string): Promise<boolean> {
    const { HeadObjectCommand } = require("@aws-sdk/client-s3");
    const safeName = path.basename(fileName);

    try {
      await this.s3.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: safeName
      }));
      return true;
    } catch {
      return false;
    }
  }

  async delete(fileName: string): Promise<void> {
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
    const safeName = path.basename(fileName);

    try {
      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: safeName
      }));
    } catch (err: any) {
      console.warn(`⚠️ Object ${fileName} failed to delete from S3:`, err.message);
    }
  }

  async getReadStream(fileName: string): Promise<Readable> {
    const { GetObjectCommand } = require("@aws-sdk/client-s3");
    const safeName = path.basename(fileName);

    const response = await this.s3.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: safeName
    }));

    return response.Body as Readable;
  }
}

const storageProviderName = process.env.STORAGE_PROVIDER || "local";
const isProductionStorage = process.env.NODE_ENV === "production";
let activeStorage: VideoStorageProvider;

if (isProductionStorage && storageProviderName !== "s3") {
  throw new Error("CRITICAL: Local filesystem video storage is prohibited in production environment.");
}

if (storageProviderName === "s3") {
  try {
    activeStorage = new ObjectStorageProvider();
    console.log("⚙️  Using AWS S3 compatible private object storage provider");
  } catch (err: any) {
    if (isProductionStorage) {
      console.error("❌ CRITICAL: Failed to initialize ObjectStorageProvider in production environment.");
      throw err;
    }
    console.warn("⚠️  Failed to initialize ObjectStorageProvider. Falling back to local filesystem storage.", err.message);
    activeStorage = new LocalVideoStorageProvider();
  }
} else {
  activeStorage = new LocalVideoStorageProvider();
  console.log("⚙️  Using local private filesystem storage provider");
}

export const videoStorage = {
  upload: (fileName: string, fileBuffer: Buffer) => activeStorage.upload(fileName, fileBuffer),
  exists: (fileName: string) => activeStorage.exists(fileName),
  delete: (fileName: string) => activeStorage.delete(fileName),
  getReadStream: (fileName: string) => activeStorage.getReadStream(fileName),
  
  // Backward compatibility fallback for queue worker filePath accessing
  getFilePath: (fileName: string) => {
    if (activeStorage instanceof LocalVideoStorageProvider) {
      return activeStorage.getFilePath(fileName);
    }
    // Return filename string; queue processors will check file path directly
    return fileName;
  }
};
