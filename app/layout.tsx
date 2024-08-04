import { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { dark } from "@clerk/themes";
import Provider from "./Provider";

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "DocsHub",
	description: "Colaborative Editor",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: { colorPrimary: "#3372FF", fontSize: "16px" },
			}}
		>
			<html lang='en' suppressHydrationWarning>
				<head />
				<body
					className={cn(
						"min-h-screen font-sans antialiased",
						fontSans.variable
					)}
				>
					<Provider>{children}</Provider>
				</body>
			</html>
		</ClerkProvider>
	);
}
