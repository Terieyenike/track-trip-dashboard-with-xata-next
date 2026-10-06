import "./globals.css";
export const metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "http://localhost:3000"),
  title: {default: "Track Trips — Plan trips. Share stories. Make memories.", template: "%s | Track Trips"},
  applicationName: "Track Trips",
  openGraph: {title: "Track Trips — Plan trips. Share stories. Make memories.", description: "Plan your itinerary and budget, keep a private travel journal, and discover public stories that inspire your next journey.", siteName: "Track Trips", type: "website", images: [{url:"/assets/track-trips-social.png",width:1200,height:630,alt:"Track Trips — Plan trips. Share stories. Make memories."}]},
  twitter: {card:"summary_large_image", title:"Track Trips — Plan trips. Share stories. Make memories.", description:"Your private trip planner and journal, with public travel stories to inspire what comes next.", images:["/assets/track-trips-social.png"]},
  description:
    "Plan itineraries and budgets, record travel memories in your private journal, and discover or share public stories for your next adventure.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
