import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dingo",
    description: "Dine on the go.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={montserrat.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
