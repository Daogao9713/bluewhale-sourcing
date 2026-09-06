import Script from "next/script";
import { siteUrl } from "@/lib/site-url";
import { company } from "@/lib/xingyueyang";
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

const baseUrl = siteUrl();

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.nameZh,
  alternateName: company.brand,
  url: baseUrl,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address,
    addressLocality: "苏州市",
    addressRegion: "江苏省",
    addressCountry: "CN",
  },
  telephone: company.phone,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default:
      "江苏星玥阳科技有限公司 | 科学仪器与工业在线监测",
    template:
      "%s | 江苏星玥阳科技有限公司",
  },

  description:
    "江苏星玥阳科技有限公司，专注科学仪器、分子光谱技术与智能工业在线监测系统，覆盖近红外、红外、拉曼及工业过程在线分析应用。",

  keywords: [
    "江苏星玥阳科技有限公司",
    "星玥阳科技",
    "UNIVERSE TECH",
    "科学仪器",
    "工业在线监测",
    "近红外",
    "红外光谱",
    "拉曼光谱",
    "煤质在线监测",
    "风粉在线监测",
    "润滑油在线监测",
    "NC-300",
    "NC-500",
    "NC-700",
    "苏州工业园区",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName:
      "UNIVERSE TECH · 星玥阳",
    title:
      "江苏星玥阳科技有限公司 | 科学仪器与工业在线监测",
    description:
      "专注科学仪器、分子光谱技术与智能工业在线监测系统。",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "江苏星玥阳科技有限公司",
    description:
      "科学仪器、分子光谱技术与智能工业在线监测系统。",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-950">
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              organizationJsonLd
            ).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
