const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export async function sendTelegramMessage(chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.json();
}

export async function getLastChatId(): Promise<string | null> {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=1&offset=-1`);
  const data = await res.json();
  const updates = data?.result ?? [];
  if (updates.length === 0) return null;
  return String(updates[updates.length - 1]?.message?.chat?.id ?? "");
}
