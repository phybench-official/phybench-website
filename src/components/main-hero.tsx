"use client";

import { SplashCursor } from "@/components/ui/splash-cursor"
import Aurora from "./ui/Aurora";
import { Hero1 } from "./ui/hero-with-button";

export function MainHeroSection() {
  return (
    <>
      <div className="hidden md:block">
        <SplashCursor />
      </div>
      <div className="block md:hidden h-screen w-screen">
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={1.0}
        >
          <Hero1 />
        </Aurora>
        
      </div>
    </>
  );
}
