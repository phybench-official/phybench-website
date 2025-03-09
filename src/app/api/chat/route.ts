import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

// import { openai } from '@ai-sdk/openai';
import { deepseek } from "@ai-sdk/deepseek";
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 3000;

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { messages,model } = await req.json();

  const result = streamText({
    model: deepseek(model),
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}