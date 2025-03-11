import { NavBar } from "@/components/ui/tubelight-navbar";
import { SparklesText } from "@/components/ui/sparkles-text";
import { ModeToggle } from "./ui/toggle-mode";
import { AccountInfo } from "./account-info";

export function MyNavBar() {
  const navItems = [
    { name: "主页", url: "/", icon: "Home" },
    { name: "提交", url: "/submit", icon: "Upload" },
    // { name: '测试', url: '/chat', icon: "MessageCircle" },
    { name: "审核", url: "/examine", icon: "MessageCircle" },
    // { name: '关于', url: '/about', icon: "List" }
    { name: "发现", url: "/find", icon: "List" },
  ];

  return (
    <header className="grid grid-cols-4 relative">
      <div className="mt-7 ml-12 justify-self-start fixed z-50">
        <SparklesText text="Eureka LAB" />
      </div>
      <div className="col-span-2 justify-self-center">
        <NavBar items={navItems} />
      </div>
      <div className="mt-8 mr-12 flex flex-row space-x-4 justify-self-end fixed z-50">
        <ModeToggle />
        <AccountInfo />
      </div>
    </header>
  );
}
