import {pageMetadata} from "@/lib/page-metadata";
import AuthForm from "@/components/AuthForm";
import { configured } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AuthForm mode="forgot-password" enabled={configured()} />;
}

export const metadata = pageMetadata('Reset your password','Request a secure password reset link for your Track Trips account.',true);
