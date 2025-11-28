"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Home, Upload, Play, LineChart } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { name: "Home", href: "/", icon: Home },
        { name: "Upload", href: "/upload", icon: Upload },
        { name: "Train", href: "/train", icon: Play },
        { name: "Predict", href: "/predict", icon: LineChart },
    ];

    return (
        <nav className="sticky top-6 z-50 w-full mb-12">
            <div className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shadow-teal-900/10 group-hover:scale-105 transition-transform duration-300">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
                        Fred's <span className="text-[var(--secondary)]">Neural Network</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-6">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive
                                    ? "bg-[var(--primary)] text-white shadow-md shadow-teal-900/10"
                                    : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-highlight)]"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
