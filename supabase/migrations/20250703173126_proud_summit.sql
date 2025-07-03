/*
  # Add quiz questions table for storing generated questions

  1. New Tables
    - `quiz_questions`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `question` (text)
      - `options` (jsonb array)
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

-- Enable RLS
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