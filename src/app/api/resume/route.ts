import { NextResponse } from "next/server";
import { fetchProfileDetails, generateQuestions } from "@/services/aiService";
import { parseProfileData } from "@/services/resumeService"; // keep fallback here

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const beFormData = new FormData();
    beFormData.append("resume", file);

    const rawTextRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/parse-resume`, {
      method: "POST",
      body: beFormData,
    });

    const { rawText } = await rawTextRes.json();

    // ✅ AI step
    const aiDetails = await fetchProfileDetails(rawText);

    const finalDetails = {
      rawText,
      name: aiDetails.name,
      email: aiDetails.email,
      phone: aiDetails.phone,
    };

    // ✅ fallback if AI misses something
    if (!finalDetails.name || !finalDetails.email || !finalDetails.phone) {
      const fallbackDetails = parseProfileData(rawText);
      finalDetails.name = finalDetails.name || fallbackDetails.name;
      finalDetails.email = finalDetails.email || fallbackDetails.email;
      finalDetails.phone = finalDetails.phone || fallbackDetails.phone;
    }

    // ✅ generate questions
    const questionBank = await generateQuestions(rawText);

    return NextResponse.json({ finalDetails, questionBank });
  } catch (error) {
    console.error("API Error processing resume:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
