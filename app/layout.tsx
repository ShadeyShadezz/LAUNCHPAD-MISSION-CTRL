import "@/app/globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import ClientAppWrapper from "./ClientAppWrapper";

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
	return (
		<html
			lang="en"
			className={`${manrope.variable} ${spaceGrotesk.variable} min-h-full scroll-smooth`}
			suppressHydrationWarning
		>
			<body
				className={`${manrope.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20`}
			>
				<ClientAppWrapper>{children}</ClientAppWrapper>
			</body>
		</html>
	);
}
