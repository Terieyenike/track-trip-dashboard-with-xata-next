import AuthForm from "@/components/AuthForm";
import { configured, account } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (await account()) redirect("/dashboard");
  return <AuthForm mode="sign-up" enabled={configured()} />;
}
