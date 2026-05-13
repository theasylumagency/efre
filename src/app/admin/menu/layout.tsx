import "./admin.css";
import UnsavedChangesProvider from "./ui/unsaved/UnsavedChangesProvider";
import AdminSidebar from "./ui/AdminSidebar";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
    const ok = await isAdminAuthenticated();
    if (!ok) redirect("/admin");

    return (
        <UnsavedChangesProvider>
            <div className="flex min-h-screen bg-[#0b0d12]">
                <AdminSidebar />

                <main className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 p-6 md:p-10">
                        <div className="max-w-[1200px] mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </UnsavedChangesProvider>
    );
}
