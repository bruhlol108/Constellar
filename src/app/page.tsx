"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LandingPage from "@/components/LandingPage";
import CosmicLoader from "@/components/CosmicLoader";

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
        <CosmicLoader size="lg" />
      </div>
    );
  }

  // Show landing page if not signed in
  if (showLanding) {
    return <LandingPage />;
  }

  return null;
}