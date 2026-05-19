/* CARE PLUS - API layer (RPCs + CRUD). Only data access file the frontend needs. */

const API = {

    async getHomeData() {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('get_home_data', { p_user_id: user.id });
        if (error) console.error('getHomeData:', error);
        return data;
    },

    async getUserAppointments(limit, offset) {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('get_user_appointments', {
            p_user_id: user.id, p_status: null, p_limit: limit || 20, p_offset: offset || 0
        });
        if (error) console.error('getUserAppointments:', error);
        return data;
    },

    async getAvailableChallenges() {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('get_available_challenges', { p_user_id: user.id });
        if (error) console.error('getAvailableChallenges:', error);
        return data;
    },

    async getUserChallenges(status) {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('get_user_challenges', {
            p_user_id: user.id, p_status: status || null
        });
        if (error) console.error('getUserChallenges:', error);
        return data;
    },

    async getRankings(rankType, limit, offset, regionId) {
        const { data, error } = await supabase.rpc('get_rankings', {
            p_rank_type: rankType, p_limit: limit || 20, p_offset: offset || 0, p_region_id: regionId || null
        });
        if (error) console.error('getRankings:', error);
        return data;
    },

    async getUserProfile() {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('get_user_profile', { p_user_id: user.id });
        if (error) console.error('getUserProfile:', error);
        return data;
    },

    async acceptChallenge(challengeId) {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('accept_challenge', {
            p_user_id: user.id, p_challenge_id: challengeId
        });
        if (error) console.error('acceptChallenge:', error);
        return data;
    },

    // The big one: books a slot and creates the appointment/exam in one go
    async createAppointment(params) {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('create_appointment', {
            p_user_id: user.id, p_type: params.type,
            p_procedure_id: params.procedure_id || null, p_doctor_id: params.doctor_id || null,
            p_specialty_id: params.specialty_id || null, p_name: params.name || null,
            p_scheduled_at: params.scheduled_at || null, p_location: params.location || null,
            p_notes: params.notes || null, p_slot_id: params.slot_id || null
        });
        if (error) console.error('createAppointment:', error);
        return data;
    },

    async cancelAppointment(type, id) {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('cancel_appointment', {
            p_user_id: user.id, p_type: type, p_id: id
        });
        if (error) console.error('cancelAppointment:', error);
        return data;
    },

    async rescheduleAppointment(type, id, slotId) {
        const user = await getCurrentUser();
        if (!user) return null;
        const { data, error } = await supabase.rpc('reschedule_appointment', {
            p_user_id: user.id, p_type: type, p_id: id, p_slot_id: slotId
        });
        if (error) console.error('rescheduleAppointment:', error);
        return data;
    },

    async getFormOptions() {
        const { data, error } = await supabase.rpc('get_form_options');
        if (error) console.error('getFormOptions:', error);
        return data;
    },

    async getDoctorAvailableDates(doctorId) {
        const { data, error } = await supabase.rpc('get_doctor_available_dates', { p_doctor_id: doctorId });
        if (error) console.error('getDoctorAvailableDates:', error);
        return data || [];
    },

    async getDoctorAvailableTimes(doctorId, date) {
        const { data, error } = await supabase.rpc('get_doctor_available_times', { p_doctor_id: doctorId, p_date: date });
        if (error) console.error('getDoctorAvailableTimes:', error);
        return data || [];
    },

    async getExamFacilities(procedureId) {
        const { data, error } = await supabase.rpc('get_exam_facilities', { p_procedure_id: procedureId });
        if (error) console.error('getExamFacilities:', error);
        return data || [];
    },

    async getExamAvailableDates(procedureId, facilityId) {
        const { data, error } = await supabase.rpc('get_exam_available_dates', { p_procedure_id: procedureId, p_facility_id: facilityId });
        if (error) console.error('getExamAvailableDates:', error);
        return data || [];
    },

    async getExamAvailableTimes(procedureId, facilityId, date) {
        const { data, error } = await supabase.rpc('get_exam_available_times', { p_procedure_id: procedureId, p_facility_id: facilityId, p_date: date });
        if (error) console.error('getExamAvailableTimes:', error);
        return data || [];
    },

    async getNotifications(limit) {
        const user = await getCurrentUser();
        if (!user) return [];
        const { data, error } = await supabase
            .from('notifications').select('*').eq('user_id', user.id)
            .order('created_at', { ascending: false }).limit(limit || 50);
        if (error) console.error('getNotifications:', error);
        return data || [];
    },

    async getUnreadCount() {
        const user = await getCurrentUser();
        if (!user) return 0;
        const { count, error } = await supabase
            .from('notifications').select('*', { count: 'exact', head: true })
            .eq('user_id', user.id).eq('read', false);
        if (error) console.error('getUnreadCount:', error);
        return count || 0;
    },

    async markNotificationRead(id) {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
        if (error) console.error('markNotificationRead:', error);
        return !error;
    },

    async markAllNotificationsRead() {
        const user = await getCurrentUser();
        if (!user) return false;
        const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
        if (error) console.error('markAllNotificationsRead:', error);
        return !error;
    },

    async getUserEvents() {
        const user = await getCurrentUser();
        if (!user) return [];
        const { data, error } = await supabase.rpc('get_user_events', { p_user_id: user.id });
        if (error) console.error('getUserEvents:', error);
        return data || [];
    },

    async getUserNews(limit) {
        const user = await getCurrentUser();
        if (!user) return [];
        const { data, error } = await supabase.rpc('get_user_news', { p_user_id: user.id, p_limit: limit || 20 });
        if (error) console.error('getUserNews:', error);
        return data || [];
    },

    async getAdminStats() {
        const { data, error } = await supabase.rpc('get_admin_stats');
        if (error) console.error('getAdminStats:', error);
        return data;
    },

    // Swiss army knife for admin CRUD — don't touch unless you enjoy debugging RLS at 3am
    async list(table, options) {
        options = options || {};
        let query = supabase.from(table).select(options.select || '*', { count: 'exact' });
        if (options.filters) {
            for (const [col, val] of Object.entries(options.filters)) {
                query = query.eq(col, val);
            }
        }
        if (options.search && options.searchColumn) {
            query = query.ilike(options.searchColumn, '%' + options.search + '%');
        }
        if (options.order) {
            query = query.order(options.order.column || 'created_at', { ascending: options.order.ascending ?? false });
        } else {
            query = query.order('created_at', { ascending: false });
        }
        const limit = options.limit || 20;
        const offset = options.offset || 0;
        query = query.range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        if (error) console.error('list ' + table + ':', error);
        return { data: data || [], count: count || 0 };
    },

    async getById(table, id) {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        if (error) console.error('getById ' + table + ':', error);
        return data;
    },

    async create(table, record) {
        const { data, error } = await supabase.from(table).insert(record).select().single();
        if (error) console.error('create ' + table + ':', error);
        return { data, error };
    },

    async update(table, id, record) {
        const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
        if (error) console.error('update ' + table + ':', error);
        return { data, error };
    },

    async remove(table, id) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) console.error('remove ' + table + ':', error);
        return { error };
    }
};
