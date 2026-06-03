"use client";
import "@/app/globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "./AppShell";
import { usePathname } from "next/navigation";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isLoginPage = pathname === "/login";

	return (
		<html
			lang="en"
			className={`${manrope.variable} ${spaceGrotesk.variable} h-full scroll-smooth`}
			suppressHydrationWarning
		>
			<body
				className={`${manrope.className} h-full bg-background text-foreground antialiased overflow-hidden selection:bg-primary/20`}
			>
				<AuthProvider>
					<ThemeProvider>
						<main className="h-full flex overflow-hidden relative">
							{isLoginPage ? children : <AppShell>{children}</AppShell>}
						</main>
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
