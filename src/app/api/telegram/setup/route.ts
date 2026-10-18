import { NextResponse } from "next/server";
import { getLastChatId } from "@/lib/telegram";

// Visit /api/telegram/setup after messaging your bot to save chat ID
export async function GET() {
  const chatId = await getLastChatId();
  if (!chatId) {
    return NextResponse.json({
      ok: false,
      message: "No messages found. Please send any message to your Telegram bot first, then visit this URL.",
    });
  }
  return NextResponse.json({
    ok: true,
    chatId,
    message: `Found chat ID: ${chatId}. Add TELEGRAM_CHAT_ID=${chatId} to your .env.local on Vercel.`,
  });
}
