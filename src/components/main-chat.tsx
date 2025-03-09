"use client";

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Chat from "@/components/chat-part"

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  return (
    <div className="flex flex-col mt-20 px-32">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message-2">Send Text</Label>
        <Textarea 
          placeholder="Type your message here."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)} 
        />
        <p className="text-sm text-muted-foreground">
          Your message will be uploaded to AI.
        </p>
        <Button onClick={() => setIsSubmitted(true)} className="mt-2">
          Submit
        </Button>
      </div>

      {isSubmitted && (
        <Chat initinput={inputMessage} model="deepseek-chat" />
      )}
    </div>
  )
}