import LoginPageContent from "@/components/pages/LoginPageContent";
import { Providers } from "@/components/Providers";

export default function LoginPage() {
  return (
    <Providers requireAgeVerification={false}>
      <LoginPageContent />
    </Providers>
  );
}
