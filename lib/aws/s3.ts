import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from './config';

/**
 * Generate a pre-signed URL for uploading files to S3
 * @param key - The S3 object key (file path)
 * @param contentType - The MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 5 minutes)
 */
export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a pre-signed URL for downloading/viewing files from S3
 * @param key - The S3 object key (file path)
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3
 * @param key - The S3 object key (file path)
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a unique file key for S3 storage
 * @param fileName - Original file name
 * @param folder - Optional folder path
 */
export function generateFileKey(fileName: string, folder: string = 'products'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop();
  return `${folder}/${timestamp}-${randomString}.${extension}`;
}
