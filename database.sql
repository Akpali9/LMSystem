CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_months INT DEFAULT 3,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  pass_score INT DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  status TEXT DEFAULT 'pending_payment',
  enrolled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  current_module_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id),
  student_id UUID REFERENCES profiles(id),
  receipt_url TEXT,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id),
  module_id UUID REFERENCES modules(id),
  status TEXT DEFAULT 'locked',
  score INT,
  completed_at TIMESTAMPTZ
);
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id),
  title TEXT NOT NULL,
  description TEXT,
  due_days INT DEFAULT 7,
  max_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES profiles(id),
  enrollment_id UUID REFERENCES enrollments(id),
  status TEXT DEFAULT 'pending',
  submission_url TEXT,
  score INT,
  feedback TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);
-- Create a bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');
