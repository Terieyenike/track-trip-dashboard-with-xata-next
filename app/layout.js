import "./globals.css";
export const metadata = {
  title: "Track Trips — A little planning. A world of memories.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  description:
    "Your personal travel workspace. Plan adventures and collect the moments that matter.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
