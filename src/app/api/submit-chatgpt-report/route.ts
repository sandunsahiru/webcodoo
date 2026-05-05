import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, email, purchaseDate } = body;

    if (!phone || !email || !purchaseDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const message =
      `🚨 *New ChatGPT Replacement Report*\n\n` +
      `📱 *Phone Number:* \`${phone}\`\n` +
      `📧 *ChatGPT Email:* \`${email}\`\n` +
      `📅 *Purchase Date:* ${purchaseDate}\n\n` +
      `⏰ _Submitted at ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" })} (LKT)_`;

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramRes = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
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
