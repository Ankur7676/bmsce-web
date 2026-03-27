import { Inter } from "next/font/google";
import "./globals.css";
import VoiceWidget from "../components/VoiceWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "BMSCE – B.M.S. College of Engineering, Bengaluru",
  description:
    "B.M.S. College of Engineering (BMSCE) – Autonomous institution affiliated to VTU, NAAC A++ accredited, NIRF ranked. Founded 1946 in Bengaluru. 20+ departments, 350+ recruiting companies.",
  keywords: [
    "BMSCE",
    "BMS College of Engineering",
    "Engineering College Bengaluru",
    "NAAC A++",
    "VTU",
  ],
  openGraph: {
    title: "BMSCE – B.M.S. College of Engineering",
    description: "Where Innovation Meets Legacy. Since 1946.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-[var(--font-inter)]" suppressHydrationWarning>
        {children}
        <VoiceWidget />
      </body>
    </html>
  );
}
