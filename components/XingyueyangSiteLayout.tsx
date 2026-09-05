import type { ReactNode } from "react";
import XingyueyangHeader from "@/components/XingyueyangHeader";
import XingyueyangFooter from "@/components/XingyueyangFooter";
import FloatingAI from "@/components/FloatingAI";

export default function XingyueyangSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="xy-glass-canvas min-h-screen">
      <XingyueyangHeader />

      {children}

      <XingyueyangFooter />

      <FloatingAI />
    </div>
  );
}