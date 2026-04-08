import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4 py-12">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="Webcodoo"
            width={200}
            height={70}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>

        {/* Maintenance Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
          </span>
          <span className="text-yellow-500 text-sm font-medium">Under Maintenance</span>
        </div>

        {/* Main message */}
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          We&apos;re building something amazing
        </h1>
        <p className="text-zinc-400 text-base md:text-lg mb-10 leading-relaxed">
          Premium subscriptions for ChatGPT, Grammarly, and more digital tools at the best prices.
          Our website is currently under maintenance — stay connected for updates!
        </p>

        {/* Channel links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
          <a
            href="https://chat.whatsapp.com/EGBkKn9ji8aAMVrq94soa5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl p-4 hover:bg-[#25D366]/15 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">WhatsApp Channel</p>
              <p className="text-zinc-500 text-xs">Join for updates</p>
            </div>
          </a>

          <a
            href="https://t.me/webcodoo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-xl p-4 hover:bg-[#229ED9]/15 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Telegram Channel</p>
              <p className="text-zinc-500 text-xs">Join for updates</p>
            </div>
          </a>
        </div>

        {/* Payment CTA */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6 max-w-sm mx-auto">
          <p className="text-zinc-400 text-sm mb-4">
            Ready to make a payment? View our bank details and payment options.
          </p>
          <Link
            href="/payment"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payment Details
          </Link>
        </div>

        {/* Footer */}
        <p className="text-zinc-600 text-xs">
          &copy; {new Date().getFullYear()} Webcodoo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
