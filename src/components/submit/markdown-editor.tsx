import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import RenderMarkdown from "@/components/render-markdown";
import { cn } from "@/lib/utils";

export function MarkdownEditor({
  text,
  setText,
  placeholder,
  title,
  classNames,
  ...props
}: {
  text: string;
  setText: (v: string) => void;
  placeholder: string;
  title?: string;
  classNames?: string;
  [key: string]: any;
}) {
  const [visibleValue, setVisibleValue] = useState(text);

  return (
    <>
      <Tabs defaultValue="edit" onValueChange={(value) => {
        if (value === 'preview') {
          setVisibleValue(text);
        }
      }} className="w-full flex flex-col flex-1" {...props}>
        <div className="flex flex-row space-x-4">
          {
            title && (
              <h3 className="text-md font-medium mt-1.5">{title}</h3>
            )
          }
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="edit" className="flex-1 overflow-hidden">
          <Textarea
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={cn("w-full resize-none overflow-y-auto h-[35vh]",classNames)}
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 overflow-hidden">
          <div className={cn("border p-2 h-[35vh] overflow-y-auto text-start",classNames)}>
            <RenderMarkdown content={visibleValue} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}