import PrivacyPageContent from "@/components/pages/PrivacyPageContent";
import { Providers } from "@/components/Providers";

export default function PrivacyPage() {
  return (
    <Providers requireAgeVerification={false}>
      <PrivacyPageContent />
    </Providers>
  );
}
