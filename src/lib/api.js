// =============================================
// NOBILIS ACADEMY - SUPABASE API FUNCTIONS
// =============================================
// Файл: src/lib/api.js

import { supabase } from './supabase';

// =============================================
// АВТОРИЗАЦИЯ
// =============================================

export const authAPI = {
  // Вход по email/password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Вход по логину (кастомный - ищем email по логину)
  async signInWithLogin(login, password) {
    // Сначала находим email по логину
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('login', login)
      .single();
    
    if (profileError || !profile) {
      throw new Error('Пользователь не найден');
    }

    return this.signIn(profile.email, password);
  },

  // Выход
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Получить текущего пользователя
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, profile };
  },

  // Создать пользователя (для куратора)
  async createUser(email, password, metadata) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    });
    if (error) throw error;
    return data;
  }
};

// =============================================
// УЧЕНИКИ
// =============================================

export const studentsAPI = {
  // Получить всех учеников
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        documents(*),
        exam_results(*),
        letters(*),
        student_internships(*, internship:internships(*))
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Получить ученика по ID
  async getById(id) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        documents(*),
        exam_results(*),
        letters(*),
        student_internships(*, internship:internships(*)),
        schedule_students(schedule:schedule(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Получить ученика по user_id
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        documents(*),
        exam_results(*),
        letters(*),
        student_internships(*, internship:internships(*)),
        schedule_students(schedule:schedule(*))
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Создать ученика
  async create(studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Обновить ученика
  async update(id, updates) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Удалить ученика
  async delete(id) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Обновить результат теста
  async updateTestResult(id, testResult) {
    return this.update(id, { test_result: testResult });
  }
};

// =============================================
// ПРЕПОДАВАТЕЛИ
// =============================================

export const teachersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        syllabus(*),
        teacher_lessons(*)
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        syllabus(*),
        teacher_lessons(*),
        schedule(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        syllabus(*),
        teacher_lessons(*),
        schedule(*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(teacherData) {
    const { data, error } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Рассчитать зарплату
  async calculateSalary(teacherId, month = new Date()) {
    const { data, error } = await supabase
      .rpc('calculate_teacher_salary', { 
        p_teacher_id: teacherId,
        p_month: month.toISOString().split('T')[0]
      });
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// РАСПИСАНИЕ
// =============================================

export const scheduleAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        teacher:teachers(id, name),
        schedule_students(student:students(id, name))
      `)
      .order('day')
      .order('time');
    
    if (error) throw error;
    return data;
  },

  async getByTeacherId(teacherId) {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        schedule_students(student:students(id, name))
      `)
      .eq('teacher_id', teacherId)
      .order('day')
      .order('time');
    
    if (error) throw error;
    return data;
  },

  async getByStudentId(studentId) {
    const { data, error } = await supabase
      .from('schedule_students')
      .select(`
        schedule:schedule(
          *,
          teacher:teachers(id, name)
        )
      `)
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data.map(item => item.schedule);
  },

  async create(scheduleData, studentIds = []) {
    const { data, error } = await supabase
      .from('schedule')
      .insert(scheduleData)
      .select()
      .single();
    
    if (error) throw error;

    // Добавить связи с учениками
    if (studentIds.length > 0) {
      const links = studentIds.map(studentId => ({
        schedule_id: data.id,
        student_id: studentId
      }));
      
      await supabase.from('schedule_students').insert(links);
    }

    return data;
  },

  async update(id, updates, studentIds = null) {
    const { data, error } = await supabase
      .from('schedule')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Обновить связи с учениками
    if (studentIds !== null) {
      await supabase.from('schedule_students').delete().eq('schedule_id', id);
      
      if (studentIds.length > 0) {
        const links = studentIds.map(studentId => ({
          schedule_id: id,
          student_id: studentId
        }));
        await supabase.from('schedule_students').insert(links);
      }
    }

    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =============================================
// УРОКИ ПРЕПОДАВАТЕЛЕЙ (посещаемость препода)
// =============================================

export const teacherLessonsAPI = {
  async getAll(month = new Date()) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('teacher_lessons')
      .select(`
        *,
        teacher:teachers(id, name, hourly_rate),
        schedule:schedule(id, subject, room)
      `)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByTeacherId(teacherId, month = new Date()) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('teacher_lessons')
      .select(`
        *,
        schedule:schedule(id, subject, room)
      `)
      .eq('teacher_id', teacherId)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Преподаватель отмечает урок
  async markLesson(data) {
    const { data: result, error } = await supabase
      .from('teacher_lessons')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // Обновить статус урока
  async updateStatus(id, status, note = null, rescheduledTo = null) {
    const updates = { status, note };
    if (rescheduledTo) updates.rescheduled_to = rescheduledTo;
    
    const { data, error } = await supabase
      .from('teacher_lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Куратор подтверждает урок
  async confirmLesson(id, curatorId) {
    const { data, error } = await supabase
      .from('teacher_lessons')
      .update({
        confirmed_by_curator: true,
        confirmed_at: new Date().toISOString(),
        confirmed_by: curatorId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// ПОСЕЩАЕМОСТЬ УЧЕНИКОВ
// =============================================

export const attendanceAPI = {
  async getBySchedule(scheduleId, date) {
    const { data, error } = await supabase
      .from('student_attendance')
      .select(`
        *,
        student:students(id, name)
      `)
      .eq('schedule_id', scheduleId)
      .eq('date', date);
    
    if (error) throw error;
    return data;
  },

  async getByStudent(studentId, month = new Date()) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('student_attendance')
      .select(`
        *,
        schedule:schedule(id, subject)
      `)
      .eq('student_id', studentId)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);
    
    if (error) throw error;
    return data;
  },

  async mark(attendanceData) {
    const { data, error } = await supabase
      .from('student_attendance')
      .upsert(attendanceData, { onConflict: 'student_id,schedule_id,date' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markBatch(records) {
    const { data, error } = await supabase
      .from('student_attendance')
      .upsert(records, { onConflict: 'student_id,schedule_id,date' })
      .select();
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// ДОКУМЕНТЫ
// =============================================

export const documentsAPI = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(documentData) {
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    // Сначала получаем документ чтобы удалить файл
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (doc?.file_path) {
      await supabase.storage.from('documents').remove([doc.file_path]);
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Загрузить файл
  async uploadFile(file, studentId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return { path: data.path, url: publicUrl };
  }
};

// =============================================
// РЕЗУЛЬТАТЫ ЭКЗАМЕНОВ
// =============================================

export const examResultsAPI = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(resultData) {
    const { data, error } = await supabase
      .from('exam_results')
      .insert(resultData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('exam_results')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('exam_results')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =============================================
// ПРОБНЫЕ ТЕСТЫ
// =============================================

export const mockTestsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('mock_tests')
      .select(`
        *,
        mock_test_students(
          *,
          student:students(id, name)
        )
      `)
      .order('date');
    
    if (error) throw error;
    return data;
  },

  async create(testData, studentIds = []) {
    const { data, error } = await supabase
      .from('mock_tests')
      .insert(testData)
      .select()
      .single();
    
    if (error) throw error;

    if (studentIds.length > 0) {
      const links = studentIds.map(studentId => ({
        mock_test_id: data.id,
        student_id: studentId
      }));
      await supabase.from('mock_test_students').insert(links);
    }

    return data;
  },

  async update(id, updates, studentIds = null) {
    const { data, error } = await supabase
      .from('mock_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    if (studentIds !== null) {
      await supabase.from('mock_test_students').delete().eq('mock_test_id', id);
      
      if (studentIds.length > 0) {
        const links = studentIds.map(studentId => ({
          mock_test_id: id,
          student_id: studentId
        }));
        await supabase.from('mock_test_students').insert(links);
      }
    }

    return data;
  },

  // Записать результат пробного теста
  async recordResult(mockTestId, studentId, score) {
    const { data, error } = await supabase
      .from('mock_test_students')
      .update({ 
        result_score: score, 
        result_date: new Date().toISOString().split('T')[0] 
      })
      .eq('mock_test_id', mockTestId)
      .eq('student_id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// ЗАЯВКИ В ПОДДЕРЖКУ
// =============================================

export const supportAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        student:students(id, name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getOpen() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        student:students(id, name, email, phone)
      `)
      .eq('status', 'open')
      .order('priority', { ascending: false })
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  async create(ticketData) {
    const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 часов
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ ...ticketData, deadline: deadline.toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async resolve(id, curatorId) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: curatorId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async setPriority(id, priority) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ priority })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// СТАЖИРОВКИ
// =============================================

export const internshipsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('deadline');
    
    if (error) throw error;
    return data;
  },

  async create(internshipData) {
    const { data, error } = await supabase
      .from('internships')
      .insert(internshipData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async applyStudent(studentId, internshipId) {
    const { data, error } = await supabase
      .from('student_internships')
      .insert({ student_id: studentId, internship_id: internshipId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(studentId, internshipId, status) {
    const { data, error } = await supabase
      .from('student_internships')
      .update({ status })
      .eq('student_id', studentId)
      .eq('internship_id', internshipId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// ПИСЬМА
// =============================================

export const lettersAPI = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(letterData) {
    const { data, error } = await supabase
      .from('letters')
      .insert(letterData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('letters')
      .update({ ...updates, last_edit: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =============================================
// СИЛЛАБУС
// =============================================

export const syllabusAPI = {
  async getByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('syllabus')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  async create(syllabusData) {
    const { data, error } = await supabase
      .from('syllabus')
      .insert(syllabusData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProgress(id, progress) {
    const { data, error } = await supabase
      .from('syllabus')
      .update({ progress })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('syllabus')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
