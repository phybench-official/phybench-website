import { Scoreboard } from "@/components/main-find";
import { PieChartProblem } from "@/components/piechart-problem";
import { auth } from "@/auth";
import { NotAuthorized } from "@/components/ui/not-authorized";

export default async function Page() {
  const session = await auth();
  if (!session) return <NotAuthorized />;
  
  return (
    <div className="flex flex-col gap-4 md:mt-32 mt-36">
      <PieChartProblem />
      <Scoreboard />
    </div>
  );
}
