import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ControlPanel } from "@/components/control/control-panel";
import { isAdminAuthenticated, isAdminProtectionEnabled } from "@/lib/admin-auth";
import { listLunchOrders } from "@/lib/order-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Control",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function ControlPage() {
  const isProtected = isAdminProtectionEnabled();
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-start justify-center px-4 py-4 sm:px-6 sm:py-8">
        <AdminLoginForm
          description="აქედან ჩანს ცოცხალი შეკვეთები და მათი დადასტურება."
          title="Control"
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <ControlPanel initialOrders={listLunchOrders()} />
      {!isProtected ? (
        <div className="mx-auto mb-8 w-full max-w-[1120px] px-4 sm:px-6">
          <p className="rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
            პაროლი გამორთულია. თუ კონტროლის დაცვა გინდა, დააყენე{" "}
            <code>LUNCH_ADMIN_PASSWORD</code>.
          </p>
        </div>
      ) : null}
    </main>
  );
}
