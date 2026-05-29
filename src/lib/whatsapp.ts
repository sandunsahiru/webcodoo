export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const apiUrl      = process.env.EVOLUTION_API_URL
  const apiKey      = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME

  if (!apiUrl || !apiKey || !instanceName) {
    return { success: false, error: 'WhatsApp API not configured' }
  }

  const to = phoneNumber.replace(/\D/g, '')

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({
        number: to,
        options: { delay: 1200 },
        textMessage: { text: message },
      }),
    })
    const data = await res.json()
    if (res.ok && data.key) return { success: true }
    return { success: false, error: data.message ?? 'Unknown error' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
