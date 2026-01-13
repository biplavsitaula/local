import TermsPageContent from "@/components/pages/TermsPageContent";
import { Providers } from "@/components/Providers";

export default function TermsPage() {
  return (
    <Providers requireAgeVerification={false}>
      <TermsPageContent />
    </Providers>
  );
}
