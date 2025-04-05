import Image from "next/image";
import Link from "next/link"; // 新增导入
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UnderConstruction() {
  return (
    <div className="w-full h-screen flex flex-row justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>页面正在施工中</CardTitle>
          <CardDescription>敬请期待</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="/undraw_construction.svg"
            alt="Security illustration"
            width={300}
            height={200}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button className="cursor-pointer" type="submit">
              返回主页
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
