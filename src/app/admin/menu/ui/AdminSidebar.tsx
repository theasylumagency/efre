"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Tags,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("efre_sidebar_expanded");
        if (stored !== null) {
            setIsExpanded(stored === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const nextState = !isExpanded;
        setIsExpanded(nextState);
        localStorage.setItem("efre_sidebar_expanded", String(nextState));
    };

    const links = [
        { href: "/admin", label: "ლანჩი & კანჭი", icon: LayoutDashboard },
        { href: "/admin/menu/dishes", label: "კერძები", icon: UtensilsCrossed },
        { href: "/admin/menu/categories", label: "კატეგორიები", icon: Tags },
    ];

    if (!mounted) return <aside className="w-16 md:w-52 h-screen bg-[#0F1320] border-r border-white/5 flex-shrink-0 sticky top-0 z-50"></aside>;

    return (
        <aside className={`h-screen bg-[#0F1320] border-r border-white/5 flex flex-col transition-all duration-300 flex-shrink-0 sticky top-0 z-50 w-16 ${isExpanded ? "md:w-52" : "md:w-16"}`}>
            {/* Logo Area */}
            <div className={`h-20 flex items-center border-b border-white/5 justify-center ${isExpanded ? "md:justify-start md:px-8" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isExpanded ? "hidden md:flex bg-white" : "border border-white/20"}`}>
                    <span className={`font-serif ${isExpanded ? "text-[#0F1320] font-bold text-lg" : "text-white text-sm"}`}>E</span>
                </div>
                {/* Mobile minimal logo always visible */}
                <div className={`w-8 h-8 border border-white/20 rounded-full flex items-center justify-center ${isExpanded ? "md:hidden" : "hidden"}`}>
                    <span className="text-white font-serif text-sm">E</span>
                </div>
                {isExpanded && <span className="ml-3 font-serif text-xl tracking-widest text-white hidden md:block overflow-hidden">EFRE</span>}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 py-3 rounded-xl transition-all ${isExpanded ? "md:px-3 justify-center md:justify-start" : "justify-center"} ${isActive
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-[#9aa6bd] hover:bg-white/5 hover:text-white"
                                }`}
                            title={!isExpanded ? link.label : undefined}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {isExpanded && <span className="font-light tracking-wide text-sm whitespace-nowrap hidden md:block">{link.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Toggle Button */}
            <div className="p-3 border-t border-white/5 hidden md:block">
                <button
                    onClick={toggleSidebar}
                    className={`w-full flex items-center justify-center py-2 rounded-xl text-[#9aa6bd] hover:bg-white/5 hover:text-white transition-colors`}
                    title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={async () => {
                        await fetch("/api/admin/logout", { method: "POST" });
                        window.location.href = "/admin";
                    }}
                    className={`w-full flex items-center gap-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${isExpanded ? "md:px-3 justify-center md:justify-start" : "justify-center"}`}
                    title={!isExpanded ? "Logout" : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="font-light tracking-wide text-sm hidden md:block">გამოსვლა</span>}
                </button>
            </div>
        </aside>
    );
}
