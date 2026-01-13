import RegisterPageContent from "@/components/pages/RegisterPageContent";
import { Providers } from "@/components/Providers";

export default function RegisterPage() {
  return (
    <Providers requireAgeVerification={false}>
      <RegisterPageContent />
    </Providers>
  );
}
