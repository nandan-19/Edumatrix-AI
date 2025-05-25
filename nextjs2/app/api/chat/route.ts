import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import pdfParse from "pdf-parse-new";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const formData = await req.formData();
    const question = formData.get("question") as string;
    try {
      const contextRes = await fetch(`http://localhost:8000/rag?query=${encodeURIComponent(question)}`);
      const { context } = await contextRes.json();
      console.log("context", context);
      // Parse PDF with options
      // Construct prompt with proper formatting
      const prompt = `Document Content:\n${context}\n\nQuestion: ${question}`;
      const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      const result = await client.chat.stream({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
      });

      // Streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result) {
            const streamText = chunk.data.choices[0].delta.content;
            if (typeof streamText === "string") {
              controller.enqueue(encoder.encode(streamText));
            }
          }
          controller.close();
        },
      });

      clearTimeout(timeoutId);

      return new Response(stream, {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("Error parsing PDF:", error);
      return NextResponse.json({ error: "PDF parsing error" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error processing request:", error);

    if (error.name === "AbortError") {
      return new Response("Request timeout", { status: 408 });
    }

    return new Response(error.message || "Internal Server Error", {
      status: error.status || 500,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
