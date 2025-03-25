"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Upload, MessageCircle, List } from "lucide-react"
import { usePathname } from "next/navigation"

interface NavItem {
  name: string
  url: string
  icon: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

const icons = {
  "Home": Home,
  "Upload": Upload,
  "MessageCircle": MessageCircle,
  "List": List,
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const initialActive = items.find(item => pathname.startsWith(item.url))?.name || items[0].name
  const [activeTab, setActiveTab] = useState(initialActive)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (!isMobile && window.innerWidth < 768) {
        setIsMobile(true)
      } else if (isMobile && window.innerWidth >= 768) {
        setIsMobile(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobile])
  
  useEffect(() => {
    // 找出所有匹配的项目
    const matchingItems = items.filter(item => pathname.startsWith(item.url));
    if (matchingItems.length > 0) {
      const bestMatch = matchingItems.reduce((prev, current) => 
        prev.url.length > current.url.length ? prev : current
      );
      if (bestMatch.name !== activeTab) {
        setActiveTab(bestMatch.name);
      }
    }
  }, [pathname, items]);

  return (
    <div
      className={cn(
        "fixed bottom-0 h-20 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons]
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
