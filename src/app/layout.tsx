import type { Metadata } from "next"
import { Changa } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const changa = Changa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-changa",
  display: "swap",
})

export const metadata: Metadata = {
  title: "CSHUB Contábil",
  description: "Módulo Contábil CSHUB – Gestão de POPs e Procedimentos",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={changa.variable}>
      <body className="min-h-screen bg-background antialiased" style={{ fontFamily: "var(--font-changa), sans-serif" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={300}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
