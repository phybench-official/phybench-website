import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function NotFound() {
  return (
    <div className="w-full h-screen flex flex-row justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>Oops!</CardTitle>
          <CardDescription>404 Not Found</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="/undraw_not-found.svg"
            alt="404 illustration"
            width={300}
            height={200}
          />
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
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
