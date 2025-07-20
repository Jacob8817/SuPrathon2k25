const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  ListBucketsCommand,
} = require('@aws-sdk/client-s3');
require('dotenv').config();

const minioClient = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

module.exports = {
  minioClient,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  ListBucketsCommand,
};
