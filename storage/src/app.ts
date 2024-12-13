import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";
import express, { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import sharp from "sharp";

const s3 = new S3Client({
  region: "eu2",
  endpoint: "https://eu2.contabostorage.com",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const app = express();

app.get(
  "/covers/*",
  expressAsyncHandler(async (req: Request, res: Response) => {
    const key = req.params[0];
    const width = req.query.width ? Number(req.query.width) : 2550;

    const getObject = new GetObjectCommand({
      Bucket: "covers",
      Key: key,
    });

    try {
      const obj = await s3.send(getObject);
      const resizer = sharp().resize({ width }).webp();
      res.header({
        "Content-Type": "image/webp",
        "Content-Disposition": "inline",
      });
      (obj.Body as NodeJS.ReadableStream).pipe(resizer).pipe(res);
    } catch (e) {
      console.log(e);
      res.status(404).json({ message: "Can't find cover", key });
    }
  }),
);

app.listen(3001, () => {
  console.log("S3 server started on :3001");
});
