-- Create storage bucket for bank statements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bank-statements',
  'bank-statements',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
CREATE POLICY "Users can upload own statements"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bank-statements' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own statements"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bank-statements' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own statements"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'bank-statements' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Table to track statement processing
CREATE TABLE IF NOT EXISTS statement_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'reviewing')),
  extracted_count INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS on statement_imports
ALTER TABLE statement_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own statement imports"
  ON statement_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statement imports"
  ON statement_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statement imports"
  ON statement_imports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own statement imports"
  ON statement_imports FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_statement_imports_user_id ON statement_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_statement_imports_status ON statement_imports(status);

