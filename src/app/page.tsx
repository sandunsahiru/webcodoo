import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Web<span className="text-blue-500">codoo</span>
          </h1>
          <p className="mt-2 text-zinc-500 text-sm tracking-widest uppercase">
            Digital Tool Subscriptions
          </p>
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
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          We&apos;re building something amazing
        </h2>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          Premium subscriptions for ChatGPT, Grammarly, LinkedIn and more digital tools at the best prices. Our website is currently under maintenance. We&apos;ll be back soon!
        </p>

        {/* Product cards preview */}
        <div className="grid grid-cols-3 gap-3 mb-10 max-w-md mx-auto">
          {["ChatGPT", "Grammarly", "LinkedIn"].map((tool) => (
            <div
              key={tool}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
            >
              <p className="text-zinc-300 text-sm font-medium">{tool}</p>
            </div>
          ))}
        </div>

        {/* CTA for existing customers */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <p className="text-zinc-300 text-sm mb-4">
            Are you a LinkedIn subscriber whose subscription was revoked?
          </p>
          <Link
            href="/linkedin-replacement"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Claim Your Replacement
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
