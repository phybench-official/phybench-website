"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UnderConstruction } from "@/components/ui/under-construction";

export default function CalculateScorePage() {
  return (
    <div className="min-h-screen overflow-y-auto">
      <Link href="/admin">
        <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          返回AdminPage主页
        </button>
      </Link>
      <UnderConstruction />
    </div>
  );
}
