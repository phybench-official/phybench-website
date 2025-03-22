import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotPermitted() {
  return (
    <div className="w-full h-screen flex flex-row justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>您没有权限查看此页面</CardTitle>
          <CardDescription>401 Unpermitted</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="/undraw_avatar.svg"
            alt="Security illustration"
            width={300}
            height={200}
          />
        </CardContent>
      </Card>
    </div>
  );
}
