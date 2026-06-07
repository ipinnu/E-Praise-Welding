import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/src/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { type, senderName, content, recipientId, recipientRole } =
      await request.json();

    if (type !== "new_message") {
      return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
    }

    let recipientEmail: string;
    let subject: string;
    let ctaUrl: string;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    if (recipientRole === "admin") {
      recipientEmail = process.env.ADMIN_EMAIL!;
      subject = `New message from ${senderName} — E-Praise Portal`;
      ctaUrl = `${siteUrl}/portal/admin`;
    } else {
      // fetch client email from DB
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", recipientId)
        .single();

      if (!profile?.email) {
        return NextResponse.json({ ok: false, error: "No recipient email" }, { status: 400 });
      }

      recipientEmail = profile.email;
      subject = "E-Praise Welding replied to your message";
      ctaUrl = `${siteUrl}/portal/chat`;
    }

    const preview = content.length > 120 ? content.slice(0, 120) + "…" : content;

    await resend.emails.send({
      from: "E-Praise Welding <portal@epraisewelding.com>",
      to: recipientEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #FFD700; border: 2px solid #000; padding: 8px 16px; display: inline-block; margin-bottom: 24px;">
            <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">E-Praise Welding</strong>
          </div>
          <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0 0 8px;">
            ${recipientRole === "admin" ? `New message from ${senderName}` : "You have a new reply"}
          </h2>
          <p style="color: #555; font-size: 14px; margin: 0 0 24px;">
            ${senderName} wrote:
          </p>
          <blockquote style="border-left: 4px solid #FFD700; margin: 0 0 32px; padding: 12px 16px; background: #fafafa;">
            <p style="margin: 0; font-size: 14px; color: #333;">${preview}</p>
          </blockquote>
          <a href="${ctaUrl}" style="display: inline-block; background: #000; color: #FFD700; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 14px 28px; text-decoration: none; border: 2px solid #000;">
            View &amp; Reply in Portal →
          </a>
          <p style="color: #aaa; font-size: 11px; margin-top: 32px;">
            You're receiving this because someone sent you a message on the E-Praise Welding portal.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
