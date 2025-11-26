import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinSight - Financial Analysis",
  description: "Advanced market analysis and predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar only visible on larger screens for now, or we can make it responsive later */}
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
