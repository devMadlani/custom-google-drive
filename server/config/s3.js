import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({ profile: "nodejsmanager" });

export const createUploadSignedUrl = async ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: "md-storage-app",
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type"]),
  });

  return url;
};

export const createGetSignedUrl = async ({
  key,
  download = false,
  filename,
}) => {
  const command = new GetObjectCommand({
    Bucket: "md-storage-app",
    Key: key,
    ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename=${encodeURIComponent(filename)}`,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  return url;
};

export const getS3FileMetaData = async (key) => {
  const command = new HeadObjectCommand({
    Bucket: "md-storage-app",
    Key: key,
  });

  return await s3Client.send(command);
};

export const deleteS3File = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: "md-storage-app",
    Key: key,
  });

  return await s3Client.send(command);
};

export const deleteS3Files = async (keys) => {
  console.log(keys);
  const command = new DeleteObjectsCommand({
    Bucket: "md-storage-app",
    Delete: {
      Objects: keys,
    },
  });

  return await s3Client.send(command);
};
