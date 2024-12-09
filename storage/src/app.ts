import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";
import express, { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";

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

    const getObject = new GetObjectCommand({
      Bucket: "covers",
      Key: key,
    });

    try {
      const object = await s3.send(getObject);

      res.status(200);
      res.header({
        "Content-Type": object.ContentType,
        "Content-Length": object.ContentLength,
        "Content-Disposition": object.ContentDisposition,
      });
      const stream = new WritableStream({
        write(chunk, controller) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
        abort(err) {
          res.destroy(err);
        },
      });
      object.Body?.transformToWebStream().pipeTo(stream);
    } catch (e) {
      console.log(e);
      res.status(404).json({ message: "Can't find cover", key });
    }
  }),
);

app.listen(3001, () => {
  console.log("S3 server started on :3001");
});
