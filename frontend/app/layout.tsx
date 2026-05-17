import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { StaffAccessProvider } from "@/hooks/use-staff-access";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeTrace",
  description: "Luxury item passports with ownership and service history"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <StaffAccessProvider>
          <div className="app-shell min-h-screen">
            <Navbar />
            <main className="container relative py-8 md:py-12">{children}</main>
          </div>
        </StaffAccessProvider>
      </body>
    </html>
  );
}
