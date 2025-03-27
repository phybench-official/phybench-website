import { SparklesText } from "@/components/ui/sparkles-text";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { AccountInfo } from "./account-info";
import { ModeToggle } from "./ui/toggle-mode";

export function MyNavBar() {
  const navItems = [
    { name: "主页", url: "/"},
    { name: "提交", url: "/submit"},
    // { name: '测试', url: '/chat', icon: "MessageCircle" },
    { name: "审核", url: "/examine"},
    { name: "发现", url: "/find"},
  ];

  return (
    <header className="grid grid-cols-4 relative items-stretch">
      <div className="mt-7 ml-6 lg:ml-12 justify-self-start fixed z-50">
        <SparklesText text="Eureka LAB" />
      </div>
      <div className="col-span-2 justify-self-center">
        <NavBar items={navItems} />
      </div>
      <div className="mt-6 lg:mt-8 mr-6 lg:mr-12 flex flex-row space-x-4 justify-self-end fixed z-50">
        <ModeToggle />
        <AccountInfo />
      </div>
    </header>
  );
}
