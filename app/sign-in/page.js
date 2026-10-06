import {pageMetadata} from "@/lib/page-metadata";
import { safeNext } from "@/lib/security.mjs";
import AuthForm from "@/components/AuthForm";
import { configured, account } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page(props) {
  const searchParams = await props.searchParams;
  const destination = safeNext(searchParams.next);
  if (await account()) redirect(destination);
  return (
    <AuthForm
      mode="sign-in"
      destination={destination}
      enabled={configured()}
      confirmationError={searchParams.error === "confirmation"}
    />
  );
}

export const metadata = pageMetadata('Sign in','Sign in to your private trips, journal, saved stories, and publishing workspace.',true);
