import { NextResponse } from "next/server";
import {
  extractTextFromBlob,
  parseProfileData,
} from "@/services/resumeService";
import { fetchProfileDetails, generateQuestions } from "@/services/aiService"; 

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    const fileName = file.name;

    const rawText = await extractTextFromBlob(fileBuffer, fileName);

    const aiDetails = await fetchProfileDetails(rawText);

    const finalDetails = {
      rawText: rawText,
      name: aiDetails.name,
      email: aiDetails.email,
      phone: aiDetails.phone,
    };

    if (!finalDetails.name || !finalDetails.email || !finalDetails.phone) {
      const fallbackDetails = parseProfileData(rawText);

      finalDetails.name = finalDetails.name || fallbackDetails.name;
      finalDetails.email = finalDetails.email || fallbackDetails.email;
      finalDetails.phone = finalDetails.phone || fallbackDetails.phone;
    }

    const questionBank = await generateQuestions(rawText);
    return NextResponse.json({ finalDetails, questionBank: questionBank });
  } catch (error) {
    console.error("API Error processing resume:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
