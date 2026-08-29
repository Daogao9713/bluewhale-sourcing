import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blue Whale New Energy | 蓝鲸新能源",
    template: "%s | Blue Whale New Energy",
  },
  description:
    "江苏蓝鲸新能源有限公司，面向新能源产业、全球商务、供应链协同与数字化业务场景提供企业服务。",
  keywords: [
    "蓝鲸新能源",
    "Blue Whale New Energy",
    "新能源",
    "global business",
    "supply chain",
    "sourcing",
    "Japan",
    "China",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-950">{children}</body>
    </html>
  );
}
