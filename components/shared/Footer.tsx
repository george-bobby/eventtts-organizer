"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";

const platformLinks = [
  { name: "Explore", href: "/explore" },
  { name: "Create", href: "/create" },
  { name: "Dashboard", href: "/dashboard" },
];

const contactItems: { name: string; href?: string }[] = [
  { name: "support@eventtts.live", href: "mailto:support@eventtts.live" },
  { name: "+91 9876543210" },
  { name: "Bengaluru, Karnataka" },
];

const Footer = () => {
  return (
    <footer className="relative bg-black text-white">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
            {/* Brand */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <Image
                  src="/images/logo-full.png"
                  alt="Eventtts Logo"
                  width={150}
                  height={45}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              </Link>

              <p className="text-white/50 leading-relaxed max-w-sm text-sm">
                Connecting people through amazing event experiences. Discover,
                create, and attend events that matter to you.
              </p>
            </div>

            {/* Platform */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-white mb-6">Platform</h3>
              <ul className="space-y-4">
                {platformLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-medium text-white mb-6">Contact</h3>
              <ul className="space-y-4">
                {contactItems.map((item) => (
                  <li key={item.name}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-white/40 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <span className="text-sm text-white/40">{item.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-white mb-6">Legal</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Event information and policies are provided on this site for
                convenience. For legal questions, contact us.
              </p>
            </div>
          </div>
        </div>

        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Eventtts. Made with ❤️ in Bengaluru.
          </p>

          <div className="flex items-center gap-4 text-sm text-white/30">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#eca8d6]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
