import {pageMetadata} from "@/lib/page-metadata";
import AuthForm from "@/components/AuthForm";
import { account } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await account())) redirect("/forgot-password");
  return <AuthForm mode="reset-password" enabled />;
}

export const metadata = pageMetadata('Choose a new password','Set a new password to restore access to your Track Trips account.',true);
