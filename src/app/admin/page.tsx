import type { Metadata } from "next";
import { isAdminAuthenticated, isAdminProtectionEnabled } from "@/lib/admin-auth";
import { lunchDataFilePath, readLunchData } from "@/lib/lunch-store";
import { AdminEditor } from "@/components/admin/admin-editor";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function AdminPage() {
  const isProtected = isAdminProtectionEnabled();
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-start justify-center px-4 py-4 sm:px-6 sm:py-8">
        <AdminLoginForm />
      </main>
    );
  }

  const data = await readLunchData();

  return (
    <main className="flex-1">
      <AdminEditor
        initialData={data}
        isProtected={isProtected}
        storagePath={lunchDataFilePath}
      />
    </main>
  );
}
