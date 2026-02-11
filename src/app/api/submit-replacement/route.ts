import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { whatsapp, subscriptionType, redeemLink, purchaseDate, screenshotUrl } = body;

    if (!whatsapp || !subscriptionType || !redeemLink || !purchaseDate || !screenshotUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const subLabel = subscriptionType === "business" ? "Business Premium" : "Sales Navigator";

    const message =
      `🔔 *New LinkedIn Replacement Request*\n\n` +
      `📱 *WhatsApp:* \`${whatsapp}\`\n` +
      `📦 *Subscription:* ${subLabel}\n` +
      `🔗 *Redeem Link:* \`${redeemLink}\`\n` +
      `📅 *Purchase Date:* ${purchaseDate}\n` +
      `📸 *Screenshot:* [View Image](${screenshotUrl})`;

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramRes = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });

    if (!telegramRes.ok) {
      const errData = await telegramRes.json();
      console.error("Telegram API error:", errData);
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
