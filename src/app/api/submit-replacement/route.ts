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

    // Send WhatsApp confirmation message via WAAPI (best-effort, errors ignored)
    try {
      const cleanedNumber = whatsapp.replace(/[\s\-\(\)\+]/g, "");
      const chatId = `${cleanedNumber}@c.us`;

      await fetch(
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
              "Dear Valued Customer,\n\n" +
              "Thank you for submitting your replacement request. We have received it successfully. 🙏\n\n" +
              "Our team is already working on processing your *LinkedIn Career Premium – 12 Months* replacement as quickly as possible.\n\n" +
              "We truly appreciate your understanding and continued trust in us. We will keep you updated on the progress.\n\n" +
              "Thank you for your patience and cooperation.\n\n" +
              "Best regards,\n" +
              "Team WebCodoo",
          }),
        }
      );
    } catch {
      // Silently ignore WhatsApp send errors
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
