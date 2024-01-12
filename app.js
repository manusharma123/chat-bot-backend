const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors("http://http://localhost:4200/"));
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const gen = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

const model = gen.getGenerativeModel({
  model: "gemini-pro-vision",
  generationConfig,
});

function formatImage(base64Image, mimeType) {
  return {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };
}

async function generateContent(prompt, base64Image, mimeType) {
  return await model.generateContent([
    prompt,
    formatImage(base64Image, mimeType),
  ]);
}

app.post("/upload", upload.single("image"), async (req, res) => {
  // console.log("CLicked");
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageBuffer = req.file.buffer;
  const base64Image = imageBuffer.toString("base64");
  const mimeType = req.file.mimetype;

  const promt = req.body.prompt;

  const modelRespone = await generateContent(promt, base64Image, mimeType);

  const textRespone = modelRespone.response.text();

  res.status(200).json({ message: textRespone });
});

app.post("/test", upload.single("image"), async (req, res) => {
  console.log(req);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageBuffer = req.file.buffer;
  const base64Image = imageBuffer.toString("base64");
  const mimeType = req.file.mimetype;

  const promt = req.body.prompt;

  console.log("Hi", promt, base64Image, mimeType);

  const modelRespone = await generateContent(promt, base64Image, mimeType);

  const textRespone = modelRespone.response.text();

  res.status(200).json({ message: "Success" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
