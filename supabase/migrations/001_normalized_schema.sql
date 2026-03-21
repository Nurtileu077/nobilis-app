-- =============================================
-- NOBILIS ACADEMY - NORMALIZED DATABASE SCHEMA
-- Migration: 001_normalized_schema
-- =============================================

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =============================================
-- 1. PROFILES (staff + students)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  login TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('director','academic_director','rop','curator','teacher','coordinator','sales_manager','callcenter','office_manager','accountant','student')),
  department TEXT,
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_login ON profiles(login);

-- =============================================
-- 2. STUDENTS (extended profile)
-- =============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contract_no TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  city TEXT,
  grade TEXT,
  age INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','process','completed','refund','graduated_2025','graduated_2026','paused')),
  graduation_year INTEGER,
  join_date DATE DEFAULT CURRENT_DATE,
  contract_end_date DATE,
  manager TEXT,
  conditions TEXT,
  study_period TEXT,
  total_contract_sum NUMERIC(12,2) DEFAULT 0,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  payment_type TEXT,
  payment_conditions TEXT,
  bitrix_link TEXT,
  target_ielts TEXT,
  target_sat TEXT,
  selected_countries JSONB DEFAULT '[]',
  target_universities JSONB DEFAULT '[]',
  deadlines JSONB DEFAULT '{}',
  initial_results JSONB DEFAULT '{}',
  test_result JSONB,
  test_scores JSONB,
  english_test_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_profile ON students(profile_id);

-- =============================================
-- 3. PACKAGES (learning packages per student)
-- =============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ielts','sat','support')),
  start_date DATE,
  end_date DATE,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  missed_lessons INTEGER DEFAULT 0,
  current_stage INTEGER DEFAULT 1,
  stage_notes JSONB DEFAULT '{}',
  frozen BOOLEAN DEFAULT false,
  frozen_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_packages_student ON packages(student_id);

-- =============================================
-- 4. SCHEDULE (lessons/classes)
-- =============================================
CREATE TABLE IF NOT EXISTS schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id),
  day TEXT NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  room TEXT,
  format TEXT DEFAULT 'offline' CHECK (format IN ('offline','online')),
  meet_link TEXT,
  is_curator BOOLEAN DEFAULT false,
  student_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedule_teacher ON schedule(teacher_id);
CREATE INDEX idx_schedule_day ON schedule(day);

-- =============================================
-- 5. ATTENDANCE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedule(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, schedule_id, date)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- =============================================
-- 6. DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT,
  file_url TEXT,
  file_size TEXT,
  score TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_student ON documents(student_id);

-- =============================================
-- 7. EXAM RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  score NUMERIC(6,2),
  date DATE NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exam_results_student ON exam_results(student_id);

-- =============================================
-- 8. LETTERS (motivation/recommendation)
-- =============================================
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('motivation','recommendation')),
  university TEXT,
  author TEXT,
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft',
  file_name TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_letters_student ON letters(student_id);

-- =============================================
-- 9. MOCK TESTS
-- =============================================
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  room TEXT,
  student_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. INTERNSHIPS
-- =============================================
CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  country TEXT,
  type TEXT,
  requirements TEXT,
  deadline DATE,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. CHAT MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_name TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- =============================================
-- 12. PAYMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT DEFAULT 'freedom_pay',
  receipt_url TEXT,
  note TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON payments(student_id);

-- =============================================
-- 13. TASKS (global tasks, Bitrix-style)
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  assigned_by TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done')),
  due_date DATE,
  department TEXT,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

-- =============================================
-- 14. LEADS (CRM)
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  notes JSONB DEFAULT '[]',
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);

-- =============================================
-- 15. STUDENT HISTORY (audit log)
-- =============================================
CREATE TABLE IF NOT EXISTS student_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_student ON student_history(student_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_history ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin (director/academic_director/curator)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_id = auth.uid()
    AND role IN ('director','academic_director','curator','rop')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES: Everyone can read, only admins can write
CREATE POLICY profiles_read ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_admin_write ON profiles FOR ALL USING (is_admin());

-- STUDENTS: Admins see all, students see own
CREATE POLICY students_admin ON students FOR ALL USING (is_admin());
CREATE POLICY students_own ON students FOR SELECT USING (
  profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
);

-- PACKAGES: Admins manage, students view own
CREATE POLICY packages_admin ON packages FOR ALL USING (is_admin());
CREATE POLICY packages_student ON packages FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- SCHEDULE: Everyone can read
CREATE POLICY schedule_read ON schedule FOR SELECT USING (true);
CREATE POLICY schedule_admin ON schedule FOR ALL USING (is_admin());

-- ATTENDANCE: Admins manage, students view own
CREATE POLICY attendance_admin ON attendance FOR ALL USING (is_admin());
CREATE POLICY attendance_student ON attendance FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- DOCUMENTS: Admins manage, students view own
CREATE POLICY documents_admin ON documents FOR ALL USING (is_admin());
CREATE POLICY documents_student ON documents FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- EXAM RESULTS: Admins manage, students view own
CREATE POLICY exam_results_admin ON exam_results FOR ALL USING (is_admin());
CREATE POLICY exam_results_student ON exam_results FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- LETTERS: Admins manage, students manage own
CREATE POLICY letters_admin ON letters FOR ALL USING (is_admin());
CREATE POLICY letters_student ON letters FOR ALL USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- CHAT: Users can read/write own messages
CREATE POLICY chat_read ON chat_messages FOR SELECT USING (true);
CREATE POLICY chat_write ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY chat_update ON chat_messages FOR UPDATE USING (true);

-- PAYMENTS: Admins manage, students view own
CREATE POLICY payments_admin ON payments FOR ALL USING (is_admin());
CREATE POLICY payments_student ON payments FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- TASKS: Everyone can read assigned, admins manage all
CREATE POLICY tasks_read ON tasks FOR SELECT USING (true);
CREATE POLICY tasks_admin ON tasks FOR ALL USING (is_admin());

-- LEADS: Sales team sees all
CREATE POLICY leads_sales ON leads FOR ALL USING (
  get_user_role() IN ('director','rop','sales_manager','callcenter')
);

-- INTERNSHIPS & MOCK TESTS: Everyone can read
CREATE POLICY internships_read ON internships FOR SELECT USING (true);
CREATE POLICY internships_admin ON internships FOR ALL USING (is_admin());
CREATE POLICY mock_tests_read ON mock_tests FOR SELECT USING (true);
CREATE POLICY mock_tests_admin ON mock_tests FOR ALL USING (is_admin());

-- STUDENT HISTORY: Admins see all, students see own
CREATE POLICY history_admin ON student_history FOR ALL USING (is_admin());
CREATE POLICY history_student ON student_history FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
