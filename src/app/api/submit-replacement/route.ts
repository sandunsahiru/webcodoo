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

    // Send WhatsApp confirmation message via WAAPI (best-effort)
    try {
      // Clean the phone number: remove spaces, dashes, parentheses, and leading +
      const cleanedNumber = whatsapp.replace(/[\s\-\(\)\+]/g, "");
      const chatId = `${cleanedNumber}@c.us`;

      const waRes = await fetch(
        `https://waapi.app/api/v1/instances/${process.env.WHATSAPP_INSTANCE_ID}/client/action/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          },
          body: JSON.stringify({
            chatId,
            message:
              "Hello! 👋\n\n" +
              "We have received your LinkedIn subscription replacement request.\n\n" +
              "We are working on it and will provide you with a replacement as soon as possible.\n\n" +
              "Thank you for your patience! 🙏",
          }),
        }
      );

      if (!waRes.ok) {
        const waErr = await waRes.json();
        console.error("WhatsApp API error:", waErr);
      }
    } catch (waError) {
      console.error("WhatsApp send failed:", waError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
