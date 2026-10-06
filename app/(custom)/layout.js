import { Workspace } from "@/components/Workspace";
import { account } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Layout({ children }) {
  const user = await account();
  if (!user) redirect("/sign-in");
  return (
    <Workspace user={{ id: user.id, email: user.email }}>{children}</Workspace>
  );
}

export const metadata = {robots:{index:false,follow:false}};
