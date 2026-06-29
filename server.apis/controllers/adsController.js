
import * as config from '../config/aws.js';
import { nanoid } from 'nanoid';



export const uploadImage = async (req, res) => {
     try {
          console.log("BODY:", req.body);
          const { image } = req.body;

          const base64Image = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""),
               "base64"
          );
          const type = image.split(";")[0].split("/")[1];


          /* image params */
          const params = {
               Bucket: process.env.AWS_S3_BUCKET || "pulsechat-media",
               Key: `${nanoid()}.${type}`,
               Body: base64Image,
               ContentEncoding: "base64",
               ContentType: `image/${type}`
          };
          config.AWSS3.upload(params, (err, data) => {
               if (err) {
                    console.log(err);
                    res.sendStatus(400);
               } else {
                    console.log(data);
                    res.send(data);
               }
          });


     } catch (err) {
          console.log(err);
          res.json({ error: "Upload Failed….try again" })
     }
}

export const uploadAudio = async (req, res) => {
     try {
          const { audio } = req.body;
          if (!audio) {
               return res.status(400).json({ error: "No audio data provided" });
          }

          const parts = audio.split("base64,");
          if (parts.length !== 2) throw new Error("Invalid audio format");

          const base64Data = parts[1];
          const meta = parts[0];

          const typeMatch = meta.match(/^data:(audio\/[a-zA-Z0-9-]+)/);
          const mimeType = typeMatch ? typeMatch[1] : "audio/webm";
          const ext = mimeType.split("/")[1] || "webm";

          // Create binary buffer
          const binaryAudio = Buffer.from(base64Data, "base64");

          const params = {
               Bucket: process.env.AWS_S3_BUCKET || "pulsechat-media",
               Key: `audio_${nanoid()}.${ext}`,
               Body: binaryAudio,
               ContentType: mimeType
          };

          config.AWSS3.upload(params, (err, data) => {
               if (err) {
                    console.error("S3 Audio Upload Error Details:", err);
                    return res.status(400).json({ error: err.message, code: err.code });
               } else {
                    res.send(data);
               }
          });

     } catch (err) {
          console.error("uploadAudio error:", err);
          res.status(500).json({ error: "Audio Upload Failed. Try again" });
     }
}


export const deleteImage = (req, res) => {
     try {
          const { Key, Bucket } = req.body;
          config.AWSS3.deleteObject({ Bucket, Key }, (err, data) => {
               if (err) {
                    console.log(err);
                    res.sendStatus(400);
               } else {
                    res.send({ ok: true });
               }
          });
     } catch (err) {
          console.log(err);
     }
}
