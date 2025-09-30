const express = require("express");
const pdf = require("pdf-parse");
const multer = require("multer");
const mammoth = require("mammoth");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ai-interview-assistant-xi.vercel.app",
    ],
  })
);

const upload = multer();

app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileType = fileName.split(".").pop()?.toLowerCase();

    let rawText = "";

    if (fileBuffer.length > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit.");
    }

    if (fileType === "pdf") {
      const data = await pdf(fileBuffer);
      rawText = data.text;
    } else if (fileType === "docx") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = result.value;
    } else if (fileType === "txt") {
      rawText = fileBuffer.toString("utf8");
    } else {
      throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
    }

    res.json({ rawText });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
