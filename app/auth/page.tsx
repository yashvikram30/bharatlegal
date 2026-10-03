import { AuthForm } from "@/components/auth/auth-form";
import { PageShell } from "@/components/page";

export default function AuthPage() {
  return (
    <PageShell width="form">
      <AuthForm />
    </PageShell>
  );
}
