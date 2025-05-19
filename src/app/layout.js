import { Turret_Road } from 'next/font/google';
import localFont from 'next/font/local';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const turretRoad = Turret_Road({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "800"],
  display: "swap",
});

const truck = localFont({
  src: [
    {path: '../../public/fonts/TRUCKMACHINE.otf'},
  ],
  variable: '--font-truck',
});

export const metadata = {
  title: "RAISEit - Where Teams Compete, and Bids Rise",
  description: "A web platform where teams can compete and place bids through auction-style challenges",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={turretRoad.className}>
      <body className={`${truck.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 