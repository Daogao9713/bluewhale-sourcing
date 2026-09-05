import XingyueyangSiteLayout from "@/components/XingyueyangSiteLayout";
import { SiteLanguageProvider } from "@/components/site/SiteLanguageProvider";
import { TechnologyContent } from "@/components/site/StaticPages";

export default function Page() {
  return (
    <SiteLanguageProvider>
      <XingyueyangSiteLayout>
        <TechnologyContent />
      </XingyueyangSiteLayout>
    </SiteLanguageProvider>
  );
}