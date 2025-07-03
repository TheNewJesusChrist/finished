/*
  # Fix Policy Creation Errors

  1. Tables
    - Only create quiz_questions table if it doesn't exist
    - All other tables already exist from previous migrations

  2. Security
    - Use conditional blocks to check if policies exist before creating them
    - Handle both regular table policies and storage policies
    - Prevent duplicate policy creation errors

  3. Storage
    - Safely ensure storage bucket exists
    - Create storage policies only if they don't already exist
*/

-- Create quiz_questions table only if it doesn't exist
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

-- Create policies for profiles using conditional blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view own profile'
      AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update own profile'
      AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert own profile'
      AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create policies for courses using conditional blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view own courses'
      AND tablename = 'courses'
  ) THEN
    CREATE POLICY "Users can view own courses"
      ON courses FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert own courses'
      AND tablename = 'courses'
  ) THEN
    CREATE POLICY "Users can insert own courses"
      ON courses FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update own courses'
      AND tablename = 'courses'
  ) THEN
    CREATE POLICY "Users can update own courses"
      ON courses FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can delete own courses'
      AND tablename = 'courses'
  ) THEN
    CREATE POLICY "Users can delete own courses"
      ON courses FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for daily_skills using conditional blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view own daily skills'
      AND tablename = 'daily_skills'
  ) THEN
    CREATE POLICY "Users can view own daily skills"
      ON daily_skills FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert own daily skills'
      AND tablename = 'daily_skills'
  ) THEN
    CREATE POLICY "Users can insert own daily skills"
      ON daily_skills FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update own daily skills'
      AND tablename = 'daily_skills'
  ) THEN
    CREATE POLICY "Users can update own daily skills"
      ON daily_skills FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for quiz_questions using conditional blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view questions for own courses'
      AND tablename = 'quiz_questions'
  ) THEN
    CREATE POLICY "Users can view questions for own courses"
      ON quiz_questions FOR SELECT
      TO authenticated
      USING (
        course_id IN (
          SELECT id FROM courses WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert questions for own courses'
      AND tablename = 'quiz_questions'
  ) THEN
    CREATE POLICY "Users can insert questions for own courses"
      ON quiz_questions FOR INSERT
      TO authenticated
      WITH CHECK (
        course_id IN (
          SELECT id FROM courses WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update questions for own courses'
      AND tablename = 'quiz_questions'
  ) THEN
    CREATE POLICY "Users can update questions for own courses"
      ON quiz_questions FOR UPDATE
      TO authenticated
      USING (
        course_id IN (
          SELECT id FROM courses WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can delete questions for own courses'
      AND tablename = 'quiz_questions'
  ) THEN
    CREATE POLICY "Users can delete questions for own courses"
      ON quiz_questions FOR DELETE
      TO authenticated
      USING (
        course_id IN (
          SELECT id FROM courses WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Ensure storage bucket exists (safe operation)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-files', 'course-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies using conditional blocks
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