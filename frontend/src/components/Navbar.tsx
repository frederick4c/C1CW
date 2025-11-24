"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { name: "Home", href: "/" },
        { name: "Upload", href: "/upload" },
        { name: "Train", href: "/train" },
        { name: "Predict", href: "/predict" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-[var(--border)] shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                            5D
                        </div>
                        <span className="text-xl font-bold text-foreground">
                            Neural Network
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex gap-2">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${isActive
                                        ? "bg-[var(--primary)] text-white"
                                        : "text-foreground-secondary hover:text-foreground hover:bg-[var(--background-secondary)]"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
