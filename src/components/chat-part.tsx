"use client";

import { useChat } from "@ai-sdk/react";
import { useOnMountUnsafe } from "@/lib/hooks";

export default function Chat({
  initinput,
  model,
}: {
  initinput: string;
  model: string;
}) {
  const { messages, handleSubmit } = useChat({
    body: {
      model: model,
    },
    initialInput: initinput,
  });

  useOnMountUnsafe(() => {
    handleSubmit();
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === "user" ? "User: " : "AI: "}
          {message.reasoning && <pre>{message.reasoning}</pre>}
          {message.content}
        </div>
      ))}
    </div>
  );
}
