"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Signed in → Go to workspace (constellations list)
        router.push("/projects");
      } else {
        // Not signed in → Show landing page
        setShowLanding(true);
        setLoading(false);
      }
    });
  }, [router, supabase.auth]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Show landing page if not signed in
  if (showLanding) {
    return <LandingPage />;
  }

  return null;
}