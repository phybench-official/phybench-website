import { MoveRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

function Hero1() {
  const router = useRouter();
  return (
    <div className="w-full z-50">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 cursor-pointer group" onClick={() => router.push("/docs/about")}>
              阅读项目文档 <MoveRight className="w-4 h-4 group-hover:translate-x-[-1px] group-hover:scale-120 transition-all" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-semibold text-transparent bg-clip-text bg-linear-to-br from-cyan-800 to-yellow-700 dark:from-indigo-400 dark:to-pink-300">
              PhyBench
            </h1>
            <p className="text-lg md:text-2xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center font-semibold">
            智识共生：让北大人才与AI共攀物理新高度！
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <a href="mailto:contact@phybench.cn">
              <Button size="lg" className="gap-4" variant="outline">
                联系我们 <Mail className="w-4 h-4" />
              </Button>
            </a>
            <Button size="lg" className="gap-4 cursor-pointer" onClick={() => router.push("/submit")}>
              即刻提交题目 <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero1 };
