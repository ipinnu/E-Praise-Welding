import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

interface Props {
  searchParams: Promise<{ context?: string }>;
}

export default async function InquiryPage({ searchParams }: Props) {
  const { context } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chatUrl = context
    ? `/portal/chat?context=${encodeURIComponent(context)}`
    : "/portal/chat";

  if (user) {
    redirect(chatUrl);
  }

  redirect(`/portal/login?next=${encodeURIComponent(chatUrl)}`);
}
