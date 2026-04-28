import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ArchivePanel } from "@/components/control/archive-panel";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLunchOrders } from "@/lib/order-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Archive",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function ArchivePage() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-start justify-center px-4 py-4 sm:px-6 sm:py-8">
        <AdminLoginForm
          description="აქედან ჩანს შეკვეთების არქივი."
          title="Archive"
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <ArchivePanel initialOrders={listLunchOrders({ isArchive: true })} />
    </main>
  );
}
