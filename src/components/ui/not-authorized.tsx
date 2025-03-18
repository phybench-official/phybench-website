import { signIn } from "@/auth";
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

export function NotAuthorized() {
  return (
    <div className="w-full h-screen flex flex-row justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle>您未经授权</CardTitle>
          <CardDescription>401 Unauthorized</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="/undraw_avatar.svg"
            alt="Security illustration"
            width={300}
            height={200}
          />
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <form
            action={async () => {
              "use server";
              await signIn("uaaa");
            }}
          >
            <Button className="cursor-pointer" type="submit">
              使用UAAA登录
            </Button>
          </form>
          <form
            action={async () => {
              "use server"
              await signIn("authentik")
            }}
          >
            <Button variant="outline" className="cursor-pointer" type="submit">临时登录</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
