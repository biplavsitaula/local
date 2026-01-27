import ReturnPolicyPageContent from "@/components/pages/ReturnPolicyPageContent";
import { Providers } from "@/components/Providers";

export default function ReturnPolicyPage() {
  return (
    <Providers requireAgeVerification={false}>
      <ReturnPolicyPageContent />
    </Providers>
  );
}

