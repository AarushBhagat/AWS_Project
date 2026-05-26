const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

const {
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend server running successfully",
  });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    res.json({
      success: true,
      message: "File uploaded successfully to S3",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});