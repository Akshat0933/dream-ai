import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Dream Home AI | Snaphomz",
  description:
    "Take a 60-second lifestyle quiz and let AI design your dream home. Get AI-generated room visuals and discover matching listings on Snaphomz.",
  keywords:
    "dream home, AI home design, lifestyle quiz, real estate, Snaphomz, home personality",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="layout-content">{children}</div>
      </body>
    </html>
  );
}
