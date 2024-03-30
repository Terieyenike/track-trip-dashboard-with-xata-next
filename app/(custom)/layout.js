import Sidebar from "@/components/Sidebar";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const Metadata = {
  title: "Dashboard",
  description: "Showcase your favorable memories",
};

export default function DashboardLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div className='flex-col md:flex-row flex h-screen'>
          <Sidebar />
          <div className='w-full md:w-full overflow-auto p-10'>{children}</div>
        </div>
      </body>
    </html>
  );
}
