export interface ExtractedProfile {
  rawText: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export const extractTextFromBlob = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  const fileType = fileName.split(".").pop()?.toLowerCase();

  const pdf = eval("require")("pdf-parse");
  const mammoth = eval("require")("mammoth");

  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit.");
  }

  if (fileType === "pdf") {
    const data = await pdf(fileBuffer);
    return data.text;
  } else if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else if (fileType === "txt") {
    return fileBuffer.toString("utf8");
  }

  throw new Error(
    `Unsupported file type: ${fileType}. Only PDF, DOCX, and TXT are supported.`
  );
};

export const parseProfileData = (rawText: string): ExtractedProfile => {
  const cleanedText = rawText.replace(/\n\s*\n/g, "\n").trim();
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+\b)/;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?){1,4}\d{4,10}/;

  const emailMatch = cleanedText.match(emailRegex);
  const phoneMatch = cleanedText.match(phoneRegex);

  let extractedName = null;
  const firstLine = cleanedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)[0];
  if (firstLine && firstLine.length < 50) {
    extractedName = firstLine.trim();
  }

  return {
    rawText: cleanedText,
    name: extractedName,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].replace(/[()\-\s\.]/g, "") : null,
  };
};
