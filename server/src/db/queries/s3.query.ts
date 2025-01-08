import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "..";

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
