import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export const metadata = { title: "Admin — EL4 Designs" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Login page renders without sidebar
  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {token === process.env.ADMIN_TOKEN ? (
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
            <main className="flex-1 p-6 lg:p-8">{children}</main>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
