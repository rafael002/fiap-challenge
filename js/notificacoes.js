function toggleSidebar() {
    document.querySelector('.cp-sidebar').classList.toggle('open');
    document.querySelector('.cp-sidebar-overlay').classList.toggle('open');
}
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    await loadNotifications();
    document.getElementById('markAllRead').addEventListener('click', async function() {
        await API.markAllNotificationsRead();
        await loadNotifications();
    });
})();
async function loadNotifications() {
    var notifications = await API.getNotifications();
    var container = document.getElementById('notificationsList');
    var emptyState = document.getElementById('emptyState');
    if (!notifications || notifications.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        updateBadge(0);
        return;
    }
    emptyState.style.display = 'none';
    var unreadCount = notifications.filter(function(n) { return !n.read; }).length;
    updateBadge(unreadCount);
    container.innerHTML = notifications.map(function(n) {
        var timeAgo = getTimeAgo(n.created_at);
        var unreadClass = n.read ? '' : ' notification-unread';
        return '<div class="cp-notification-item' + unreadClass + '" data-id="' + n.id + '" onclick="markAsRead(\'' + n.id + '\', this)">' +
            '<div class="notification-icon">' +
                '<i class="bi ' + getNotificationIcon(n.title) + '"></i>' +
            '</div>' +
            '<div class="notification-content">' +
                '<div class="notification-title">' + n.title + '</div>' +
                (n.body ? '<div class="notification-body">' + n.body + '</div>' : '') +
                '<div class="notification-time">' + timeAgo + '</div>' +
            '</div>' +
            (!n.read ? '<div class="notification-dot"></div>' : '') +
        '</div>';
    }).join('');
}
async function markAsRead(id, el) {
    if (el && el.classList.contains('notification-unread')) {
        await API.markNotificationRead(id);
        el.classList.remove('notification-unread');
        var dot = el.querySelector('.notification-dot');
        if (dot) dot.remove();
        var badge = document.querySelector('.notification-badge');
        var current = parseInt(badge.textContent) || 0;
        updateBadge(Math.max(0, current - 1));
    }
}
function updateBadge(count) {
    var badge = document.querySelector('.notification-badge');
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
}
// Maps notification title keywords to Bootstrap icons
function getNotificationIcon(title) {
    if (title.toLowerCase().includes('desafio')) return 'bi-shield-check-fill';
    if (title.toLowerCase().includes('badge')) return 'bi-award-fill';
    if (title.toLowerCase().includes('lembrete') || title.toLowerCase().includes('agendamento')) return 'bi-calendar-event-fill';
    if (title.toLowerCase().includes('ponto')) return 'bi-star-fill';
    return 'bi-bell-fill';
}
function getTimeAgo(dateStr) {
    var now = new Date();
    var date = new Date(dateStr);
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Agora';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atras';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atras';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd atras';
    return date.toLocaleDateString('pt-BR');
}
