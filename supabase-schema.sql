-- =============================================
-- NOBILIS ACADEMY - SUPABASE DATABASE SCHEMA
-- =============================================
-- Запустите этот SQL в Supabase SQL Editor

-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (расширение auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'curator')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  login TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. УЧЕНИКИ
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  age INTEGER,
  grade TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  contract_end_date DATE,
  parent_name TEXT,
  parent_phone TEXT,
  test_result TEXT,
  selected_countries TEXT[],
  target_universities TEXT[],
  deadline_ielts DATE,
  deadline_sat DATE,
  deadline_applications DATE,
  attendance_total INTEGER DEFAULT 0,
  attendance_attended INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ПРЕПОДАВАТЕЛИ
CREATE TABLE public.teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  hourly_rate INTEGER DEFAULT 0,
  hours_worked DECIMAL(10,2) DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. РАСПИСАНИЕ
CREATE TABLE public.schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  day TEXT NOT NULL CHECK (day IN ('Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье')),
  time TIME NOT NULL,
  duration INTEGER DEFAULT 90, -- минуты
  room TEXT,
  is_curator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. СВЯЗЬ РАСПИСАНИЕ-УЧЕНИКИ (many-to-many)
CREATE TABLE public.schedule_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.schedule(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  UNIQUE(schedule_id, student_id)
);

-- 6. ДОКУМЕНТЫ
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  score TEXT,
  file_url TEXT,
  file_path TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. РЕЗУЛЬТАТЫ ЭКЗАМЕНОВ
CREATE TABLE public.exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- ielts, sat, mock_ielts, mock_sat, etc.
  name TEXT NOT NULL,
  score TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  breakdown JSONB, -- {listening: 7.5, reading: 7.0, ...}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ПРОБНЫЕ ТЕСТЫ (расписание)
CREATE TABLE public.mock_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('ielts', 'sat', 'toefl', 'gre')),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. СВЯЗЬ ПРОБНЫЕ ТЕСТЫ-УЧЕНИКИ
CREATE TABLE public.mock_test_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  result_score TEXT,
  result_date DATE,
  UNIQUE(mock_test_id, student_id)
);

-- 10. СТАЖИРОВКИ
CREATE TABLE public.internships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  type TEXT,
  requirements TEXT,
  deadline DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ЗАЯВКИ НА СТАЖИРОВКИ
CREATE TABLE public.student_internships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'rejected', 'pending')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, internship_id)
);

-- 12. ПИСЬМА (мотивационные и рекомендательные)
CREATE TABLE public.letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('motivation', 'recommendation')),
  university TEXT,
  author TEXT,
  subject TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'requested')),
  content TEXT,
  file_url TEXT,
  last_edit TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ЗАЯВКИ В ПОДДЕРЖКУ
CREATE TABLE public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ПОСЕЩАЕМОСТЬ УЧЕНИКОВ
CREATE TABLE public.student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedule(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  note TEXT,
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, schedule_id, date)
);

-- 15. ПОСЕЩАЕМОСТЬ/УРОКИ ПРЕПОДАВАТЕЛЕЙ
CREATE TABLE public.teacher_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedule(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'conducted', 'cancelled', 'rescheduled')),
  hours DECIMAL(4,2) DEFAULT 0,
  note TEXT,
  rescheduled_to DATE,
  confirmed_by_curator BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. СИЛЛАБУС ПРЕПОДАВАТЕЛЕЙ
CREATE TABLE public.syllabus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  weeks INTEGER DEFAULT 12,
  topics TEXT[],
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. НАСТРОЙКИ СИСТЕМЫ
CREATE TABLE public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =============================================

CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_login ON public.students(login);
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_login ON public.teachers(login);
CREATE INDEX idx_schedule_teacher_id ON public.schedule(teacher_id);
CREATE INDEX idx_schedule_day ON public.schedule(day);
CREATE INDEX idx_documents_student_id ON public.documents(student_id);
CREATE INDEX idx_exam_results_student_id ON public.exam_results(student_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_teacher_lessons_teacher_id ON public.teacher_lessons(teacher_id);
CREATE INDEX idx_teacher_lessons_status ON public.teacher_lessons(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;

-- Политики для кураторов (полный доступ)
CREATE POLICY "Curators have full access to profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'curator')
  );

CREATE POLICY "Curators have full access to students" ON public.students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'curator')
  );

CREATE POLICY "Curators have full access to teachers" ON public.teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'curator')
  );

-- Политики для учеников (только свои данные)
CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can view own documents" ON public.documents
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can view own exam results" ON public.exam_results
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

-- Политики для преподавателей
CREATE POLICY "Teachers can view own data" ON public.teachers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can update own syllabus" ON public.syllabus
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
  );

-- Публичный доступ к расписанию и стажировкам
CREATE POLICY "Everyone can view schedule" ON public.schedule
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view internships" ON public.internships
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view mock tests" ON public.mock_tests
  FOR SELECT USING (true);

-- =============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- =============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON public.schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_syllabus_updated_at BEFORE UPDATE ON public.syllabus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email, login)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'login', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Функция расчета зарплаты преподавателя
CREATE OR REPLACE FUNCTION calculate_teacher_salary(p_teacher_id UUID, p_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  teacher_name TEXT,
  hourly_rate INTEGER,
  total_hours DECIMAL,
  lessons_conducted INTEGER,
  lessons_cancelled INTEGER,
  total_salary DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.name,
    t.hourly_rate,
    COALESCE(SUM(tl.hours) FILTER (WHERE tl.status = 'conducted' AND tl.confirmed_by_curator = true), 0) as total_hours,
    COUNT(*) FILTER (WHERE tl.status = 'conducted' AND tl.confirmed_by_curator = true)::INTEGER as lessons_conducted,
    COUNT(*) FILTER (WHERE tl.status = 'cancelled')::INTEGER as lessons_cancelled,
    COALESCE(SUM(tl.hours) FILTER (WHERE tl.status = 'conducted' AND tl.confirmed_by_curator = true), 0) * t.hourly_rate as total_salary
  FROM public.teachers t
  LEFT JOIN public.teacher_lessons tl ON t.id = tl.teacher_id
    AND DATE_TRUNC('month', tl.date) = DATE_TRUNC('month', p_month)
  WHERE t.id = p_teacher_id
  GROUP BY t.id, t.name, t.hourly_rate;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (для тестирования)
-- =============================================

-- Стажировки
INSERT INTO public.internships (name, country, type, requirements, deadline) VALUES
  ('Google Summer of Code', 'США', 'IT / Программирование', 'IELTS 7.0+', '2025-03-15'),
  ('CERN Summer Student', 'Швейцария', 'Наука / Исследования', 'IELTS 6.5+', '2025-01-25'),
  ('Design Week Milan', 'Италия', 'Дизайн / Искусство', 'Portfolio', '2025-02-28'),
  ('UN Youth Programme', 'Швейцария', 'Международные отношения', 'IELTS 7.5+', '2025-04-01'),
  ('BMW Group Internship', 'Германия', 'Инженерия / Бизнес', 'IELTS 6.5+', '2025-03-01');

-- Пробные тесты
INSERT INTO public.mock_tests (type, name, date, time, room) VALUES
  ('ielts', 'Пробный IELTS #1', '2025-01-11', '10:00', '301'),
  ('sat', 'Пробный SAT #1', '2025-01-18', '09:00', '302'),
  ('ielts', 'Пробный IELTS #2', '2025-02-08', '10:00', '301'),
  ('sat', 'Пробный SAT #2', '2025-02-15', '09:00', '302');

-- =============================================
-- STORAGE BUCKETS (выполнить в Supabase Dashboard -> Storage)
-- =============================================
-- Создайте bucket "documents" для хранения файлов документов
-- Создайте bucket "avatars" для аватаров пользователей

-- SQL для политик storage (выполнить после создания buckets):
/*
-- Политика для documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Curators can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'curator')
);
*/
