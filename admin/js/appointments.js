var profilesMap = {};
var statusBadge = { SCHEDULED: 'badge-warning', COMPLETED: 'badge-active', CANCELLED: 'badge-inactive', NO_SHOW: 'badge-danger', RESCHEDULED: 'badge-info' };
var statusLabel = { SCHEDULED: 'Agendado', COMPLETED: 'Realizado', CANCELLED: 'Cancelado', NO_SHOW: 'No-show', RESCHEDULED: 'Remarcado' };
async function initAppts() {
    var user = await requireAdmin();
    if (!user) return;
    var profiles = await API.list('profiles', { select: 'id,full_name', limit: 200 });
    profiles.data.forEach(function(p) { profilesMap[p.id] = p.full_name; });
    loadAppts();
    var searchInput = document.querySelector('.search-input input');
    if (searchInput) {
        var timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(loadAppts, 300);
        });
    }
}
async function loadAppts() {
    var tbody = document.getElementById('apptBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--cp-text-secondary);">Carregando...</td></tr>';
    var appts = await API.list('appointments', { select: '*, profiles(full_name)', limit: 20, order: { column: 'scheduled_at', ascending: false } });
    var exams = await API.list('exams', { select: '*, profiles(full_name)', limit: 20, order: { column: 'scheduled_at', ascending: false } });
    var all = [];
    appts.data.forEach(function(a) { a._type = 'Consulta'; a._table = 'appointments'; all.push(a); });
    exams.data.forEach(function(e) { e._type = 'Exame'; e._table = 'exams'; all.push(e); });
    all.sort(function(a, b) { return new Date(b.scheduled_at) - new Date(a.scheduled_at); });
    if (all.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--cp-text-secondary);">Nenhum agendamento encontrado</td></tr>';
        return;
    }
    tbody.innerHTML = all.slice(0, 20).map(function(r) {
        var patientName = (r.profiles && r.profiles.full_name) || profilesMap[r.user_id] || '--';
        var dt = new Date(r.scheduled_at);
        var dtStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        var typeBadge = r._type === 'Consulta' ? 'badge-info' : 'badge-active';
        var actions = '';
        if (r.status === 'SCHEDULED') {
            actions = '<button class="btn btn-outline btn-sm btn-icon" title="Marcar realizado" onclick="markCompleted(\'' + r._table + '\',\'' + r.id + '\')"><i class="bi bi-check-lg"></i></button> ' +
                      '<button class="btn btn-outline btn-sm btn-icon" title="Marcar no-show" onclick="markNoShow(\'' + r._table + '\',\'' + r.id + '\')"><i class="bi bi-x-lg"></i></button>';
        }
        return '<tr>' +
            '<td><strong>' + patientName + '</strong></td>' +
            '<td><span class="badge ' + typeBadge + '">' + r._type + '</span></td>' +
            '<td>' + dtStr + '</td>' +
            '<td>' + (r.location || '--') + '</td>' +
            '<td><span class="badge ' + (statusBadge[r.status] || '') + '">' + (statusLabel[r.status] || r.status) + '</span></td>' +
            '<td>' + actions + '</td></tr>';
    }).join('');
}
async function markCompleted(table, id) {
    if (!confirm('Marcar como realizado?')) return;
    var result = await API.update(table, id, { status: 'COMPLETED' });
    if (result.error) { showToast('Erro: ' + result.error.message, 'error'); return; }
    showToast('Marcado como realizado!', 'success');
    loadAppts();
}
async function markNoShow(table, id) {
    if (!confirm('Marcar como no-show?')) return;
    var result = await API.update(table, id, { status: 'NO_SHOW' });
    if (result.error) { showToast('Erro: ' + result.error.message, 'error'); return; }
    showToast('Marcado como no-show.', 'warning');
    loadAppts();
}
initAppts();
