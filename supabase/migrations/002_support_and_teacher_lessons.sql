-- =============================================
-- NOBILIS ACADEMY - ADDITIONAL TABLES
-- Migration: 002_support_and_teacher_lessons
-- =============================================
-- Tables missing from 001 that are referenced by api.js

-- Support tickets (if not exists)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_student ON support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Teacher lessons (work log)
CREATE TABLE IF NOT EXISTS teacher_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedule(id),
  date DATE NOT NULL,
  status TEXT DEFAULT 'conducted' CHECK (status IN ('conducted','cancelled','rescheduled')),
  hours NUMERIC(4,2) DEFAULT 1,
  note TEXT,
  rescheduled_to DATE,
  confirmed_by_curator BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_lessons_teacher ON teacher_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_lessons_date ON teacher_lessons(date);

-- Syllabus
CREATE TABLE IF NOT EXISTS syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  total_topics INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  students JSONB DEFAULT '[]',
  youtube_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_syllabus_teacher ON syllabus(teacher_id);

-- Meetings (sales)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  title TEXT,
  date TIMESTAMPTZ,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls (sales)
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  phone TEXT,
  duration INTEGER,
  result TEXT,
  notes TEXT,
  assigned_to TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Support tickets: admins manage, students view own
CREATE POLICY support_admin ON support_tickets FOR ALL USING (is_admin());
CREATE POLICY support_student ON support_tickets FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);
CREATE POLICY support_student_create ON support_tickets FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM students WHERE profile_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid()))
);

-- Teacher lessons: teachers manage own, admins manage all
CREATE POLICY teacher_lessons_admin ON teacher_lessons FOR ALL USING (is_admin());
CREATE POLICY teacher_lessons_own ON teacher_lessons FOR ALL USING (
  teacher_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
);

-- Syllabus: teachers manage own, everyone can read
CREATE POLICY syllabus_read ON syllabus FOR SELECT USING (true);
CREATE POLICY syllabus_teacher ON syllabus FOR ALL USING (
  teacher_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
);
CREATE POLICY syllabus_admin ON syllabus FOR ALL USING (is_admin());

-- Meetings & Calls: sales team
CREATE POLICY meetings_sales ON meetings FOR ALL USING (
  get_user_role() IN ('director','rop','sales_manager','callcenter')
);
CREATE POLICY calls_sales ON calls FOR ALL USING (
  get_user_role() IN ('director','rop','sales_manager','callcenter')
);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE teacher_lessons;

-- =============================================
-- STORAGE BUCKETS (run in Supabase Dashboard)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
--
-- Storage policies:
-- CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id IN ('documents', 'avatars'));
-- CREATE POLICY "Allow authenticated upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- AUTO-PROFILE CREATION ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_id, login, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'login', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','students','letters','tasks','leads','syllabus'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END;
$$;
