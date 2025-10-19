import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/projects/[id]/context
// Returns everything the AI needs to be context-aware:
// - Project details (title, current canvas)
// - Recent conversation history (last N messages)
// - Latest version info
// - Summary stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const messageLimit = searchParams.get("messages")
      ? parseInt(searchParams.get("messages")!)
      : 10; // Default: last 10 messages

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch recent messages (limited to last N)
    const { data: messages, error: messagesError } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true })
      .limit(messageLimit);

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    // Fetch latest version
    const { data: latestVersion, error: versionError } = await supabase
      .from("project_versions")
      .select("*")
      .eq("project_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    // Version error is ok if no versions exist yet
    const version = versionError ? null : latestVersion;

    // Get total counts
    const { count: totalMessages } = await supabase
      .from("ai_messages")
      .select("*", { count: "exact", head: true })
      .eq("project_id", id);

    const { count: totalVersions } = await supabase
      .from("project_versions")
      .select("*", { count: "exact", head: true })
      .eq("project_id", id);

    // Build context object
    const context = {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        canvas_data: project.canvas_data,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      messages: messages || [],
      latest_version: version,
      stats: {
        total_messages: totalMessages || 0,
        total_versions: totalVersions || 0,
        elements_count: project.canvas_data?.elements?.length || 0,
        returned_messages: messages?.length || 0,
      },
    };

    return NextResponse.json({ context });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
