import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Poppins } from "next/font/google";
import Navbar from "../components/Navbar/Navbar";
import { SocketProvider } from "../context/SocketContext";
import ThemeProvider from "../lib/ThemeProvider";
import "./globals.css";
import StoreProvider from "./StoreProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Peared",
  description: "Service Provider Web App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased bg-white`}>
        <SocketProvider>
          <StoreProvider>
            <Navbar />
            <AntdRegistry>
              <ThemeProvider>
                <div className="pt-20">{children}</div>
              </ThemeProvider>
            </AntdRegistry>
            {/* <Footer /> */}
            {/* <NotificationListener /> */}
          </StoreProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
