export interface PricingTier {
  label: string;
  price: number;
  highlight?: boolean;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  icon: string; // emoji fallback
  logoUrl?: string; // real brand logo URL
  category: string;
  startingPrice: number;
  duration: string;
  badge?: string;
  color: string; // gradient class
  description: string;
  accessMethod: string;
  features: string[];
  plans: PricingTier[];
  note?: string;
  loginLink?: string;
}

export const products: Product[] = [
  {
    slug: "stealthwriter",
    name: "StealthWriter AI",
    tagline: "AI-powered undetectable writing",
    icon: "✍️",
    logoUrl: "/logos/stealthwriter.png",
    category: "AI Writing",
    startingPrice: 2500,
    duration: "1 Month",
    badge: "Popular",
    color: "from-violet-600 to-purple-700",
    description:
      "StealthWriter AI Premium Plan gives you access to powerful AI-undetectable writing tools. We create a dedicated account linked to your email address — access is provided through our secure portal.",
    accessMethod:
      "We create an account for your email address. Access is provided through our dedicated portal (not the official StealthWriter website) to ensure stability and prevent over-usage.",
    loginLink: "https://app.thesisseotools.com/member",
    features: [
      "Up to 5,000 words per request",
      "AI detection bypass",
      "Full 1-month warranty",
      "Dedicated portal access",
      "Human-like rewriting",
    ],
    plans: [
      { label: "20 requests/day", price: 2500 },
      { label: "30 requests/day", price: 3500, highlight: true },
      { label: "40 requests/day", price: 4250 },
      { label: "50 requests/day", price: 5000 },
    ],
    note: "All plans include full 1-month warranty and up to 5,000 words per request.",
  },
  {
    slug: "quillbot",
    name: "Quillbot Premium",
    tagline: "AI paraphrasing & humanizing",
    icon: "🖊️",
    logoUrl: "/logos/quillbot.png",
    category: "AI Writing",
    startingPrice: 400,
    duration: "1 Month",
    color: "from-green-500 to-emerald-600",
    description:
      "Official Quillbot Premium account — email and password provided. Includes AI Humanizer, Paraphraser, and Plagiarism Checker. Note: plagiarism checker has limited checks as this is a sharing account.",
    accessMethod:
      "We provide the official website login email and password directly to you.",
    features: [
      "AI Humanizer tool",
      "Paraphrasing tool",
      "Plagiarism checker (limited docs)",
      "Official account access",
      "Multiple duration options",
    ],
    plans: [
      { label: "1 Month", price: 400 },
      { label: "3 Months", price: 1000, highlight: true },
      { label: "6 Months", price: 2000 },
      { label: "1 Year", price: 2750 },
    ],
    note: "Plagiarism checker may have limited documents available as this is a shared account.",
  },
  {
    slug: "capcut",
    name: "CapCut Pro",
    tagline: "Professional video editing suite",
    icon: "🎬",
    logoUrl: "/logos/capcut.png",
    category: "Creative",
    startingPrice: 1000,
    duration: "1 Month",
    color: "from-pink-500 to-rose-600",
    description:
      "CapCut Pro official account with full access to all Pro features. Login details (email and password) provided directly to you.",
    accessMethod: "Official account login through our email and password.",
    features: [
      "All Pro editing features",
      "No watermark exports",
      "4K export support",
      "Premium templates & effects",
      "Official Pro plan",
    ],
    plans: [{ label: "1 Month", price: 1000 }],
  },
  {
    slug: "jetbrains-edu",
    name: "JetBrains Edu",
    tagline: "Full IDE suite for developers",
    icon: "💻",
    logoUrl: "/logos/jetbrains.png",
    category: "Development",
    startingPrice: 2500,
    duration: "1 Year",
    color: "from-blue-500 to-cyan-600",
    description:
      "Official JetBrains Educational subscription — equivalent to the Pro plan. Includes all JetBrains IDEs. Login details provided.",
    accessMethod: "We provide official login details for the Edu subscription.",
    features: [
      "All JetBrains IDEs",
      "IntelliJ IDEA, PyCharm, WebStorm",
      "GoLand, DataGrip, Rider & more",
      "Official Edu plan",
      "1-year access",
    ],
    plans: [{ label: "1 Year", price: 2500 }],
  },
  {
    slug: "figma-edu",
    name: "Figma Edu",
    tagline: "Professional UI/UX design tool",
    icon: "🎨",
    logoUrl: "/logos/figma.png",
    category: "Design",
    startingPrice: 3000,
    duration: "2 Years",
    badge: "Best Value",
    color: "from-orange-500 to-amber-600",
    description:
      "Official Figma Educational subscription — equivalent to the Pro plan. Login details provided. 2 full years of access.",
    accessMethod:
      "We provide official Edu login details (email and password) for the subscription.",
    features: [
      "Unlimited projects",
      "Advanced prototyping",
      "Dev Mode access",
      "Team collaboration",
      "2 years of access",
    ],
    plans: [{ label: "2 Years", price: 3000 }],
  },
  {
    slug: "ai-plagiarism",
    name: "AI & Plagiarism Checker",
    tagline: "Official Turnitin reports",
    icon: "🔍",
    logoUrl: "https://logo.clearbit.com/turnitin.com",
    category: "Academic",
    startingPrice: 400,
    duration: "Per Document",
    badge: "No Subscription",
    color: "from-red-500 to-rose-700",
    description:
      "Get official Turnitin reports from our platform. Each submission gives you both a Plagiarism (Similarity) report and an AI detection report.",
    accessMethod:
      "Submit your document through our website. You receive official Turnitin reports.",
    features: [
      "Official Turnitin similarity report",
      "AI content detection report",
      "Fast turnaround",
      "Both reports per submission",
      "No subscription needed",
    ],
    plans: [{ label: "Per Document", price: 400 }],
  },
  {
    slug: "gemini-ai",
    name: "Gemini AI Pro",
    tagline: "Google's most capable AI model",
    icon: "✨",
    logoUrl: "https://cdn.simpleicons.org/googlegemini",
    category: "AI Tools",
    startingPrice: 850,
    duration: "18 Months",
    badge: "18 Months",
    color: "from-sky-500 to-blue-600",
    description:
      "18-month Gemini AI Pro plan. We provide a subscription activation link — you activate it directly on your own Google account. No warranty.",
    accessMethod:
      "We provide a subscription activation link. You activate it yourself on your Google account email.",
    features: [
      "Gemini 1.5 Pro access",
      "Advanced reasoning",
      "Multimodal capabilities",
      "18 months duration",
      "Activate on your own account",
    ],
    plans: [{ label: "18 Months", price: 850 }],
    note: "No warranty. Activation link provided — apply to your own Google account.",
  },
  {
    slug: "duolingo-super",
    name: "Duolingo Super",
    tagline: "Learn languages without limits",
    icon: "🦉",
    logoUrl: "/logos/duolingo.png",
    category: "Education",
    startingPrice: 1500,
    duration: "1 Year",
    color: "from-lime-500 to-green-600",
    description:
      "Official Duolingo Super 1-year subscription. Email and password provided for full access to all Super features.",
    accessMethod: "We provide the official email and password login details.",
    features: [
      "No ads",
      "Unlimited hearts",
      "Legendary levels",
      "Streak repair",
      "1 year official access",
    ],
    plans: [{ label: "1 Year", price: 1500 }],
  },
  {
    slug: "edx",
    name: "edX",
    tagline: "World-class online courses",
    icon: "🎓",
    logoUrl: "https://cdn.simpleicons.org/edx",
    category: "Education",
    startingPrice: 2000,
    duration: "1 Year",
    color: "from-indigo-500 to-violet-600",
    description:
      "Official edX 1-year subscription. Email and password provided for full course access.",
    accessMethod: "We provide the official email and password login details.",
    features: [
      "Verified certificate courses",
      "Unlimited course access",
      "University-backed content",
      "MicroMasters programs",
      "1 year official access",
    ],
    plans: [{ label: "1 Year", price: 2000 }],
  },
  {
    slug: "ilovepdf",
    name: "iLovePDF",
    tagline: "Complete PDF toolkit online",
    icon: "📄",
    logoUrl: "/logos/ilovepdf.png",
    category: "Productivity",
    startingPrice: 1000,
    duration: "1 Year",
    color: "from-red-500 to-orange-600",
    description:
      "Official iLovePDF 1-year subscription. Email and password provided for unlimited PDF tools.",
    accessMethod: "We provide the official email and password login details.",
    features: [
      "Merge, split, compress PDFs",
      "PDF to Word/Excel/JPG",
      "eSign documents",
      "Unlimited use",
      "1 year official access",
    ],
    plans: [{ label: "1 Year", price: 1000 }],
  },
  {
    slug: "ms-office-365",
    name: "MS Office 365",
    tagline: "Full Microsoft productivity suite",
    icon: "🪟",
    logoUrl: "/logos/microsoft.png",
    category: "Productivity",
    startingPrice: 1250,
    duration: "1 Year",
    badge: "🔥 Hot Deal",
    color: "from-blue-600 to-indigo-700",
    description:
      "Official Microsoft 365 1-year subscription. Includes Word, Excel, PowerPoint, Outlook, Teams and more. Email and password provided.",
    accessMethod: "We provide the official email and password login details.",
    features: [
      "Word, Excel, PowerPoint",
      "1TB OneDrive storage",
      "Outlook & Teams",
      "5 devices simultaneously",
      "1 year official access",
    ],
    plans: [{ label: "1 Year", price: 1250 }],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
