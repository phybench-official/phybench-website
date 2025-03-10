"use client";

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Chat from "@/components/chat-part"
import { FetchChat } from "./fetch-chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import RenderMarkdown from "./render-markdown"

const modelList = [
  {
    "provider": "Open AI",
    "model": "gpt-4o",
  },
  {
    "provider": "DeepSeek",
    "model": "deepseek-reasoner",
  },
  {
    "provider": "DeepSeek",
    "model": "deepseek-chat",
  }
]

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  return (
    <div className="flex flex-row w-full h-full overflow-auto px-12">
      <div className="flex flex-col h-full  items-center gap-1.5">
        <Tabs defaultValue="edit" className="w-[400px] flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Card className="h-4/5">
              <CardHeader>
                <CardTitle>Edit Problem</CardTitle>
              </CardHeader>
              <CardContent >
                <Textarea 
                  placeholder="Type your message here."
                  value={inputMessage}
                  className="max-h-[60vh] min-h-[40vh] overflow-auto"
                  onChange={e => setInputMessage(e.target.value)} 
                />
                <p className="text-sm text-muted-foreground">
                  Your message will be uploaded to AI.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preview">
          <Card className="h-4/5">
              <CardHeader>
                <CardTitle>Preview Problem</CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-auto">
                <RenderMarkdown content={inputMessage} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid ml-12 grid-rows-1 grid-flow-col gap-4 flex-1 overflow-x-auto">
        {
          modelList.map((model, index) => (
            <div key={index} className="w-[400px] h-full">
              <FetchChat model={model.model} provider={model.provider} content={inputMessage} />
            </div>
          ))
        }
      </div>

      {/* <FetchChat content={inputMessage} model="gpt-4o-mini" /> */}
    </div>
  )
}