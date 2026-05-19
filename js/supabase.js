/* CARE PLUS - Supabase client, auth guards & UI helpers */

const SUPABASE_URL = 'https://fiwwzjhhswnuiqgbwjyx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uK_Bj0e1tgwI4-71O-cYCg_uWAjK2X_';

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    const { data } = await supabase
        .from('profiles')
        .select('id, full_name, birth_date, biological_sex, total_points, is_admin, region_id')
        .eq('id', user.id)
        .single();
    return data;
}

async function isAdmin() {
    const profile = await getCurrentProfile();
    return profile?.is_admin === true;
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = getLoginUrl();
}

function getLoginUrl() {
    return window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
}

function getAdminUrl() {
    return window.location.pathname.includes('/admin/') ? 'index.html' : 'admin/index.html';
}

function getHomeUrl() {
    return window.location.pathname.includes('/admin/') ? '../index.html' : 'index.html';
}

// If not logged in, you shall not pass
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = getLoginUrl();
        return null;
    }
    return user;
}

// Admins caught sneaking into user pages get redirected
async function requireUser() {
    const user = await requireAuth();
    if (!user) return null;
    const admin = await isAdmin();
    if (admin) {
        window.location.href = getAdminUrl();
        return null;
    }
    return user;
}

// Regular users caught sneaking into admin pages get redirected
async function requireAdmin() {
    const user = await requireAuth();
    if (!user) return null;
    const admin = await isAdmin();
    if (!admin) {
        window.location.href = getHomeUrl();
        return null;
    }
    return user;
}

function getInitials(fullName) {
    if (!fullName) return '??';
    return fullName.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatPoints(pts) {
    return (pts || 0).toLocaleString('pt-BR');
}

async function fillSidebarUser() {
    const profile = await getCurrentProfile();
    if (!profile) return;
    document.querySelectorAll('.sidebar-name').forEach(el => el.textContent = profile.full_name);
    document.querySelectorAll('.sidebar-avatar').forEach(el => el.textContent = getInitials(profile.full_name));
    const user = await getCurrentUser();
    if (user) {
        document.querySelectorAll('.sidebar-email').forEach(el => el.textContent = user.email);
    }
    const greeting = document.querySelector('.cp-greeting');
    if (greeting) {
        greeting.textContent = 'Ola, ' + profile.full_name.split(' ')[0] + '!';
    }
}

async function loadNotificationBadge() {
    var badge = document.querySelector('.notification-badge');
    if (!badge) return;
    const user = await getCurrentUser();
    if (!user) return;
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
    if (error) return;
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sidebar-link.danger, a[href="#logout"]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
    loadNotificationBadge();
});
