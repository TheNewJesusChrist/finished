/*
  # Add Quiz Questions Table

  1. New Tables
    - `quiz_questions`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `question` (text)
      - `options` (jsonb)
      - `correct_answer` (integer)
      - `explanation` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on quiz_questions table
    - Add policies for users to access questions for their own courses
*/

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_questions
CREATE POLICY "Users can view questions for own courses"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions for own courses"
  ON quiz_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for own courses"
  ON quiz_questions FOR UPDATE
  TO authenticated
  USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for own courses"
  ON quiz_questions FOR DELETE
  TO authenticated
  USING (
    course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    )
  );

-- Ensure storage bucket exists (safe operation)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-files', 'course-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies if they don't exist
DO $$
BEGIN
  -- Check if storage policies exist before creating them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own files'
  ) THEN
    CREATE POLICY "Users can upload their own files"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'course-files' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own files'
  ) THEN
    CREATE POLICY "Users can view their own files"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'course-files' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public file access'
  ) THEN
    CREATE POLICY "Public file access"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'course-files');
  END IF;
END $$;