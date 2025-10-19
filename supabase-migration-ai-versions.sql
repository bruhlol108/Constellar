-- Constellar AI Messages and Version History Migration
-- Run this AFTER the initial schema (supabase-schema.sql)
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste & Run

-- ============================================
-- TABLE: ai_messages
-- Stores all AI conversation history
-- ============================================

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store extra info like tokens used, model version, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by project
CREATE INDEX IF NOT EXISTS idx_ai_messages_project_id ON ai_messages(project_id);

-- Index for fast queries by created_at (for getting recent messages)
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- Combined index for project + time (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_ai_messages_project_time ON ai_messages(project_id, created_at DESC);

-- ============================================
-- TABLE: project_versions
-- Stores snapshots of canvas state over time
-- ============================================

CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  canvas_data JSONB NOT NULL,
  version_number INTEGER NOT NULL, -- Auto-incrementing version number per project
  description TEXT, -- Optional: "Added database service", "Refactored architecture"
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by project
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);

-- Index for getting latest version
CREATE INDEX IF NOT EXISTS idx_project_versions_version_number ON project_versions(project_id, version_number DESC);

-- Unique constraint: one version number per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_versions_unique ON project_versions(project_id, version_number);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on ai_messages
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS for ai_messages: Users can only see messages from their own projects
CREATE POLICY "Users can view messages from their own projects"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_messages.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their own projects"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_messages.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Enable RLS on project_versions
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- RLS for versions: Users can only see versions from their own projects
CREATE POLICY "Users can view versions from their own projects"
  ON project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions in their own projects"
  ON project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTION: Auto-increment version number
-- ============================================

CREATE OR REPLACE FUNCTION get_next_version_number(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM project_versions
  WHERE project_id = p_project_id;

  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Create version snapshot
-- Automatically assigns version number
-- ============================================

CREATE OR REPLACE FUNCTION create_version_snapshot(
  p_project_id UUID,
  p_canvas_data JSONB,
  p_description TEXT DEFAULT NULL
)
RETURNS project_versions AS $$
DECLARE
  new_version project_versions;
BEGIN
  INSERT INTO project_versions (
    project_id,
    canvas_data,
    version_number,
    description,
    created_by
  )
  VALUES (
    p_project_id,
    p_canvas_data,
    get_next_version_number(p_project_id),
    p_description,
    auth.uid()
  )
  RETURNING * INTO new_version;

  RETURN new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TESTING QUERIES (Optional)
-- ============================================

-- Test: Insert a message
-- INSERT INTO ai_messages (project_id, role, content)
-- SELECT id, 'user', 'Create a microservices diagram'
-- FROM projects LIMIT 1;

-- Test: Create a version
-- SELECT create_version_snapshot(
--   (SELECT id FROM projects LIMIT 1),
--   '{"elements": []}',
--   'Initial version'
-- );

-- Test: Get all messages for a project
-- SELECT * FROM ai_messages
-- WHERE project_id = 'your-project-id'
-- ORDER BY created_at ASC;

-- Test: Get all versions for a project
-- SELECT * FROM project_versions
-- WHERE project_id = 'your-project-id'
-- ORDER BY version_number DESC;

-- ============================================
-- DONE!
-- Your database now supports:
-- ✅ AI conversation history
-- ✅ Version control with snapshots
-- ✅ Auto-incrementing version numbers
-- ✅ Row-level security
-- ============================================
