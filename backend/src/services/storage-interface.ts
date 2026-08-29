import { Readable } from "stream";

export interface VideoStorageProvider {
  upload(fileName: string, fileBuffer: Buffer): Promise<string>;
  exists(fileName: string): Promise<boolean>;
  delete(fileName: string): Promise<void>;
  getReadStream(fileName: string): Promise<Readable>;
}
