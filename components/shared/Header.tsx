"use client";

import { sidebarLinks } from "@/constants/sidebarLinks";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { UserButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import ClientOnly from "./ClientOnly";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed z-50 transition-all duration-500 ${isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
                }`}
        >
            <nav
                className={`relative z-[60] mx-auto transition-all duration-500 ${isScrolled || isMobileMenuOpen
                    ? "bg-background/90 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
                    : "bg-background/80 backdrop-blur-sm max-w-[1400px]"
                    }`}
            >
                <div
                    className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${isScrolled ? "h-14" : "h-20"
                        }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/images/logo-full.png"
                            alt="Eventtts Logo"
                            width={130}
                            height={40}
                            className={`transition-all duration-500 object-contain dark:invert ${isScrolled ? "h-6 w-auto" : "h-8 w-auto"}`}
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {sidebarLinks.slice(1).map((link) => (
                            <Link
                                key={link.label}
                                href={link.path}
                                className={`text-sm transition-colors duration-300 relative group ${isScrolled ? "text-foreground/70 hover:text-foreground" : "text-foreground/70 hover:text-foreground"}`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-foreground`}
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA & Auth */}
                    <div className="hidden lg:flex items-center gap-4">
                        <ClientOnly>
                            <ModeToggle />
                            <Show when="signed-in">
                                <UserButton />
                            </Show>
                            <Show when="signed-out">
                                <Link
                                    href="/sign-in"
                                    className={`transition-all duration-500 text-sm text-foreground/70 hover:text-foreground`}
                                >
                                    Sign in
                                </Link>
                            </Show>
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className={`rounded-full transition-all duration-500 ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-foreground hover:bg-foreground/90 text-background px-6"}`}
                                >
                                    Dashboard
                                </Button>
                            </Link>
                        </ClientOnly>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex lg:hidden items-center gap-4">
                        <ClientOnly>
                            <ModeToggle />
                            <Show when="signed-in">
                                <UserButton />
                            </Show>
                        </ClientOnly>
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative z-[70] rounded-lg p-2 text-foreground transition-colors duration-500 hover:bg-foreground/10"
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" strokeWidth={2.25} />
                            ) : (
                                <Menu className="h-6 w-6" strokeWidth={2.25} />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu - Full Screen Overlay */}
            <div
                className={`lg:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${isMobileMenuOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
                style={{ top: 0 }}
            >
                <div className="flex flex-col h-full px-8 pt-28 pb-8">
                    {/* Navigation Links */}
                    <div className="flex-1 flex flex-col justify-center gap-8">
                        {sidebarLinks.map((link, i) => (
                            <Link
                                key={link.label}
                                href={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-4xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${isMobileMenuOpen
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-4"
                                    }`}
                                style={{
                                    transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms",
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Bottom CTAs */}
                    <div
                        className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${isMobileMenuOpen
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                            }`}
                        style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
                    >
                        <Show when="signed-out">
                            <Link href="/sign-in" className="flex-1">
                                <Button
                                    variant="outline"
                                    className="w-full rounded-full h-14 text-base"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign in
                                </Button>
                            </Link>
                        </Show>
                        <Link href="/dashboard" className="flex-1">
                            <Button
                                className="w-full bg-foreground text-background rounded-full h-14 text-base"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
