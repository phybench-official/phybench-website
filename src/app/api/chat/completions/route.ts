import OpenAI from 'openai';
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// This file demonstrates how to stream from a Next.JS server as
// a new-line separated JSON-encoded stream. This file cannot be run
// without Next.JS scaffolding.

// This endpoint can be called with:
//
//   curl 127.0.0.1:3000 -N -X POST -H 'Content-Type: text/plain' \
//     --data 'Can you explain why dogs are better than cats?'
//
// Or consumed with fetch:
//
//   fetch('http://localhost:3000', {
//     method: 'POST',
//     body: 'Tell me why dogs are better than cats',
//   }).then(async res => {
//     const runner = ChatCompletionStreamingRunner.fromReadableStream(res)
//   })
//
// See examples/stream-to-client-browser.ts for a more complete example.

export const maxDuration = 3000;

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { content, model } : { content: string, model: string } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
  });

  const stream = openai.beta.chat.completions.stream({
    model: model,
    stream: true,
    messages: [{ role: 'user', content: content }],
  });

  return new Response(stream.toReadableStream());
}