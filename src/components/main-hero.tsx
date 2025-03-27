"use client";

import { SplashCursor } from "@/components/ui/splash-cursor"
import Aurora from "./ui/Aurora";
import { Hero1 } from "./ui/hero-with-button";
import { useTheme } from "next-themes";

export function MainHeroSection() {
  const { resolvedTheme } = useTheme();
  
  const colorStops = resolvedTheme === "light" 
    ? ["#d4c0ff", "#ffc0eb", "#FFC0CB"]
    : ["#3A29FF", "#FF94B4", "#FF3232"];
    
  return (
    <>
      <div className="hidden md:block">
        <SplashCursor />
      </div>
      <div className="block md:hidden h-screen w-screen">
        <Aurora 
          colorStops={colorStops}
          blend={1.0}
          amplitude={1.0}
          speed={1.0}
        >
          <Hero1 />
        </Aurora>        
      </div>
    </>
  );
}
