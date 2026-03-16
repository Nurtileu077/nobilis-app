// =============================================
// NOBILIS ACADEMY - SUPABASE API FUNCTIONS
// =============================================
// Complete API layer for normalized Supabase schema

import { supabase } from './supabase';

// =============================================
// АВТОРИЗАЦИЯ
// =============================================

export const authAPI = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithLogin(login, password) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('login', login)
      .single();
    if (profileError || !profile) throw new Error('Пользователь не найден');
    return this.signIn(profile.email, password);
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    return { ...user, profile };
  },
};

// =============================================
// ПРОФИЛИ
// =============================================

export const profilesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getByRole(role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =============================================
// УЧЕНИКИ
// =============================================

export const studentsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!students_profile_id_fkey(*),
        packages(*),
        documents(*),
        exam_results(*),
        letters(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!students_profile_id_fkey(*),
        packages(*),
        documents(*),
        exam_results(*),
        letters(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByProfileId(profileId) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!students_profile_id_fkey(*),
        packages(*),
        documents(*),
        exam_results(*),
        letters(*)
      `)
      .eq('profile_id', profileId)
      .single();
    if (error) throw error;
    return data;
  },

  async create(studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

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

  async delete(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// ПАКЕТЫ
// =============================================

export const packagesAPI = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return data;
  },

  async create(packageData) {
    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw error;
  },
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
        teacher:profiles!schedule_teacher_id_fkey(id, name)
      `)
      .order('day')
      .order('time');
    if (error) throw error;
    return data;
  },

  async getByTeacherId(teacherId) {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('day')
      .order('time');
    if (error) throw error;
    return data;
  },

  async create(scheduleData) {
    const { data, error } = await supabase
      .from('schedule')
      .insert(scheduleData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('schedule')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('schedule').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// ПОСЕЩАЕМОСТЬ
// =============================================

export const attendanceAPI = {
  async getAll(dateFrom, dateTo) {
    let query = supabase.from('attendance').select(`
      *,
      student:students!attendance_student_id_fkey(id, profile:profiles!students_profile_id_fkey(name))
    `);
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByScheduleAndDate(scheduleId, date) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('date', date);
    if (error) throw error;
    return data;
  },

  async mark(record) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(record, { onConflict: 'student_id,schedule_id,date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markBatch(records) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,schedule_id,date' })
      .select();
    if (error) throw error;
    return data;
  },
};

// =============================================
// ДОКУМЕНТЫ + FILE STORAGE
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
    // Delete file from storage first
    const { data: doc } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .single();

    if (doc?.file_url) {
      const path = doc.file_url.split('/documents/')[1];
      if (path) await supabase.storage.from('documents').remove([path]);
    }

    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadFile(file, studentId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return { path: data.path, url: publicUrl, fileName: file.name, fileSize: file.size };
  },
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
    const { error } = await supabase.from('exam_results').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// ПРОБНЫЕ ТЕСТЫ
// =============================================

export const mockTestsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*')
      .order('date');
    if (error) throw error;
    return data;
  },

  async create(testData) {
    const { data, error } = await supabase
      .from('mock_tests')
      .insert(testData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('mock_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('mock_tests').delete().eq('id', id);
    if (error) throw error;
  },
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

  async update(id, updates) {
    const { data, error } = await supabase
      .from('internships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('internships').delete().eq('id', id);
    if (error) throw error;
  },
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
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('letters').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// ЧАТ
// =============================================

export const chatAPI = {
  async getMessages(chatId, limit = 100) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getAllChats() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('chat_id, from_user_id, from_name, message, read, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Group by chat_id
    const chats = {};
    data.forEach(msg => {
      if (!chats[msg.chat_id]) chats[msg.chat_id] = [];
      chats[msg.chat_id].push(msg);
    });
    return chats;
  },

  async sendMessage(chatId, fromUserId, fromName, message) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        from_user_id: fromUserId,
        from_name: fromName,
        message,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markRead(chatId, userId) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('from_user_id', userId);
    if (error) throw error;
  },
};

// =============================================
// ПЛАТЕЖИ
// =============================================

export const paymentsAPI = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        student:students!payments_student_id_fkey(
          id,
          profile:profiles!students_profile_id_fkey(name)
        )
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Verify Kaspi payment
  async verifyKaspi(txnId) {
    const { data, error } = await supabase.functions.invoke('verify-kaspi-payment', {
      body: { txnId },
    });
    if (error) throw error;
    return data;
  },
};

// =============================================
// ЗАДАЧИ (Bitrix-style)
// =============================================

export const tasksAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByAssignee(assignedTo) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', assignedTo)
      .order('due_date');
    if (error) throw error;
    return data;
  },

  async create(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleDone(id, currentDone) {
    return this.update(id, {
      done: !currentDone,
      status: !currentDone ? 'done' : 'pending',
    });
  },
};

// =============================================
// ЛИДЫ (CRM)
// =============================================

export const leadsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(leadData) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// ИСТОРИЯ СТУДЕНТА
// =============================================

export const historyAPI = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('student_history')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async add(studentId, text, type = 'action') {
    const { data, error } = await supabase
      .from('student_history')
      .insert({ student_id: studentId, text, type })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =============================================
// ПОДДЕРЖКА
// =============================================

export const supportAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        student:students!support_tickets_student_id_fkey(
          id,
          profile:profiles!students_profile_id_fkey(name, email, phone)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(ticketData) {
    const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ ...ticketData, deadline: deadline.toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async resolve(id, resolvedBy) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =============================================
// SYLLABUS
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

  async update(id, updates) {
    const { data, error } = await supabase
      .from('syllabus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('syllabus').delete().eq('id', id);
    if (error) throw error;
  },
};

// =============================================
// TEACHER LESSONS
// =============================================

export const teacherLessonsAPI = {
  async getByTeacherId(teacherId, month = new Date()) {
    const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('teacher_lessons')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markLesson(lessonData) {
    const { data, error } = await supabase
      .from('teacher_lessons')
      .insert(lessonData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async confirmLesson(id, curatorId) {
    const { data, error } = await supabase
      .from('teacher_lessons')
      .update({
        confirmed_by_curator: true,
        confirmed_at: new Date().toISOString(),
        confirmed_by: curatorId,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
