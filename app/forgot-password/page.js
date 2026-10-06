import AuthForm from "@/components/AuthForm";
import { configured } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AuthForm mode="forgot-password" enabled={configured()} />;
}
