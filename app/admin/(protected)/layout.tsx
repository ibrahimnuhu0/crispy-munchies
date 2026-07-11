import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "../../../components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-roast text-cream">
      <AdminSidebar adminName={session.user?.name ?? "Admin"} />
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">{children}</main>
    </div>
  );
}