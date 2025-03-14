import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button"

function Hero1() {
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Read our launch article <MoveRight className="w-4 h-4" />
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
            <Button size="lg" className="gap-4" variant="outline">
              Jump on a call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4">
              Sign up here <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero1 };
