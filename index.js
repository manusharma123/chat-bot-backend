const express = require("express");
const { GoogleGenerativeAI, GenerativeModel,  } = require("@google/generative-ai");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const upload = multer();

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};


const model = genAI.getGenerativeModel({ model: "gemini-pro-vision", generationConfig });


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(upload.none()); // Handle text data only; use upload.none() for no files

app.get("/", (req, res) => {
  res.send("Hello World!");
})

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

app.post("/generate-content", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    // Assuming the image is sent as a base64-encoded string in the "image" field of the request
    // const image = req.body.image;
    
    // Combine prompt and image data as needed
    // let image = "";
    // fs.readFileSync("./MicrosoftTeams-image (2).png", async (err, data) => {
    //   image = data;
    // })
    
    // const combinedData = `${prompt}\n\nImage: ${image}`;
    
    const result = await model.generateContent([prompt, fileToGenerativePart("./MicrosoftTeams-image (2).png", "image/png")]);
    console.log(result);
    const response =  result.response;
    
    res.json({ text: response.text() });
  } catch (error) {
    console.error("Error generating content", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/test", upload.single("image"), (req, res)=>{

  console.log(req)

  res.status(200).end()
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

