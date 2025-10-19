"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-purple-500 group-hover:text-purple-400 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Constellar
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#integration"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Integration
            </Link>
            <Link
              href="#docs"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}