import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Sparkles, GalleryVerticalEnd } from "lucide-react";

export default function Layout() {
  const { pathname } = useLocation();
  const linkCls = (active) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
      active ? "bg-stone-900 text-stone-50" : "text-stone-500 hover:text-stone-900"
    }`;
  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#faf8f4]/80 border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-[0.2em] uppercase text-stone-900">
            Atelier<span className="text-amber-700">.</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/" className={linkCls(pathname === "/")}>
              <Sparkles className="w-4 h-4" /> Studio
            </Link>
            <Link to="/designs" className={linkCls(pathname === "/designs")}>
              <GalleryVerticalEnd className="w-4 h-4" /> My Designs
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}