function toggleSidebar() {
    document.querySelector('.cp-sidebar').classList.toggle('open');
    document.querySelector('.cp-sidebar-overlay').classList.toggle('open');
}
function formatDateBR(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
var allEvents = [];
function openEventDetail(idx) {
    var e = allEvents[idx];
    if (!e) return;
    document.getElementById('eventsContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.querySelector('.cp-page-title').style.display = 'none';
    var detail = document.getElementById('detailView');
    detail.style.display = '';
    var scopeLabel = e.scope === 'REGIONAL' ? '<span class="badge bg-info">Regional</span>' : '<span class="badge bg-primary">Global</span>';
    // top_n = minimum ranking position required to see this event
    var topLabel = '<span class="badge bg-warning text-dark">Top ' + e.top_n + '</span>';
    document.getElementById('detailContent').innerHTML =
        (e.image_url ? '<img src="' + e.image_url + '" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-bottom:16px;" alt="">' : '') +
        '<div style="display:flex; gap:8px; margin-bottom:12px;">' + scopeLabel + topLabel + '</div>' +
        '<h2 style="font-size:22px; font-weight:700; margin:0 0 16px; color:var(--cp-text-primary);">' + e.name + '</h2>' +
        (e.description ? '<p style="font-size:15px; line-height:1.7; color:var(--cp-text-primary); margin:0 0 20px;">' + e.description.replace(/\n/g, '<br>') + '</p>' : '') +
        '<div style="background:var(--cp-blue-light); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:10px;">' +
            (e.event_date ? '<div style="font-size:14px;"><i class="bi bi-calendar3 me-2" style="color:var(--cp-blue);"></i><strong>Data:</strong> ' + formatDateBR(e.event_date) + '</div>' : '') +
            (e.location ? '<div style="font-size:14px;"><i class="bi bi-geo-alt me-2" style="color:var(--cp-blue);"></i><strong>Local:</strong> ' + e.location + '</div>' : '') +
        '</div>';
    window.scrollTo(0, 0);
}
function closeDetail() {
    document.getElementById('detailView').style.display = 'none';
    document.getElementById('eventsContainer').style.display = '';
    document.querySelector('.cp-page-title').style.display = '';
}
function renderEvents(events) {
    allEvents = events || [];
    var container = document.getElementById('eventsContainer');
    var empty = document.getElementById('emptyState');
    if (!events || events.length === 0) {
        container.innerHTML = '';
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';
    container.innerHTML = events.map(function(e, idx) {
        var scopeLabel = e.scope === 'REGIONAL' ? '<span class="badge bg-info">Regional</span>' : '<span class="badge bg-primary">Global</span>';
        var topLabel = '<span class="badge bg-warning text-dark">Top ' + e.top_n + '</span>';
        return '<div class="cp-card" style="margin:0 20px 16px; padding:20px; border-radius:16px; background:#fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">' +
            (e.image_url ? '<img src="' + e.image_url + '" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:12px;" alt="">' : '') +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' + scopeLabel + topLabel + '</div>' +
            '<h3 style="font-size:18px; font-weight:700; margin:0 0 8px; color:var(--cp-text-primary);">' + e.name + '</h3>' +
            (e.description ? '<p style="font-size:14px; color:var(--cp-text-secondary); margin:0 0 12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + e.description + '</p>' : '') +
            '<div style="display:flex; flex-direction:column; gap:4px; font-size:13px; color:var(--cp-text-secondary); margin-bottom:12px;">' +
                (e.event_date ? '<div><i class="bi bi-calendar3 me-1"></i>' + formatDateBR(e.event_date) + '</div>' : '') +
                (e.location ? '<div><i class="bi bi-geo-alt me-1"></i>' + e.location + '</div>' : '') +
            '</div>' +
            '<button onclick="openEventDetail(' + idx + ')" style="background:none; border:none; color:var(--cp-blue); font-size:14px; font-weight:600; padding:0; cursor:pointer;">Ver detalhes <i class="bi bi-arrow-right"></i></button>' +
        '</div>';
    }).join('');
}
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    var events = await API.getUserEvents();
    renderEvents(events);
})();
