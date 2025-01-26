import {
  DeleteObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "eu2",
  endpoint: `https://eu2.contabostorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

s3.send(new ListBucketsCommand());

/**
 * Upload a user's avatar.
 *
 * @param id the user's id
 * @param image the image data
 */
export async function uploadAvatar(id: number, image: Buffer<ArrayBufferLike>) {
  const putCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `avatars/${id}`,
    ContentType: "image/webp",
    ContentDisposition: "inline",
    Body: image,
  });

  await s3.send(putCommand);
}

/**
 * Deletes an image from S3 storage.
 *
 * @param id The user's id
 */
export async function deleteAvatarObject(id: number) {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `avatars/${id}`,
  });
  await s3.send(deleteCommand);
}
