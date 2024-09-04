import { Injectable } from '@nestjs/common';
import { s3 } from '../config/aws.config';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string }> {
    // Construct the S3 key (folder + unique file name)
    const key = `${folder}/${uuid()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype, // Specify the file's MIME type
      // ACL: 'public-read', // Uncomment if you want the file to be publicly accessible
    };

    try {
      // Upload the file to S3 and get the result
      const data: ManagedUpload.SendData = await s3.upload(params).promise();
      return { url: data.Location }; // Return the S3 URL of the uploaded file
    } catch (error) {
      throw new Error('Failed to upload file to S3: ' + error.message);
    }
  }
}
