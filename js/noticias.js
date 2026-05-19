function toggleSidebar() {
    document.querySelector('.cp-sidebar').classList.toggle('open');
    document.querySelector('.cp-sidebar-overlay').classList.toggle('open');
}
function timeAgo(dateStr) {
    var now = new Date();
    var d = new Date(dateStr);
    var diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff / 60) + ' min atras';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h atras';
    if (diff < 604800) return Math.floor(diff / 86400) + ' dias atras';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
var allNews = [];
function openNewsDetail(idx) {
    var n = allNews[idx];
    if (!n) return;
    document.getElementById('newsContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.querySelector('.cp-page-title').style.display = 'none';
    var detail = document.getElementById('detailView');
    detail.style.display = '';
    document.getElementById('detailContent').innerHTML =
        (n.image_url ? '<img src="' + n.image_url + '" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-bottom:16px;" alt="">' : '') +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">' +
            '<span style="font-size:13px; color:var(--cp-text-secondary);"><i class="bi bi-clock me-1"></i>' + timeAgo(n.published_at) + '</span>' +
            (n.region_id ? '<span class="badge bg-info">Regional</span>' : '<span class="badge bg-secondary">Geral</span>') +
        '</div>' +
        '<h2 style="font-size:22px; font-weight:700; margin:0 0 16px; color:var(--cp-text-primary);">' + n.title + '</h2>' +
        '<div style="font-size:15px; line-height:1.8; color:var(--cp-text-primary);">' + n.body.replace(/\n/g, '<br>') + '</div>';
    window.scrollTo(0, 0);
}
function closeDetail() {
    document.getElementById('detailView').style.display = 'none';
    document.getElementById('newsContainer').style.display = '';
    document.querySelector('.cp-page-title').style.display = '';
}
function renderNews(news) {
    allNews = news || [];
    var container = document.getElementById('newsContainer');
    var empty = document.getElementById('emptyState');
    if (!news || news.length === 0) {
        container.innerHTML = '';
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';
    container.innerHTML = news.map(function(n, idx) {
        return '<div class="cp-card" style="margin:0 20px 16px; padding:0; border-radius:16px; background:#fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow:hidden;">' +
            (n.image_url ? '<img src="' + n.image_url + '" style="width:100%; height:180px; object-fit:cover;" alt="">' : '') +
            '<div style="padding:16px 20px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
                    '<span style="font-size:12px; color:var(--cp-text-secondary);"><i class="bi bi-clock me-1"></i>' + timeAgo(n.published_at) + '</span>' +
                    (n.region_id ? '<span class="badge bg-info" style="font-size:11px;">Regional</span>' : '<span class="badge bg-secondary" style="font-size:11px;">Geral</span>') +
                '</div>' +
                '<h3 style="font-size:17px; font-weight:700; margin:0 0 8px; color:var(--cp-text-primary);">' + n.title + '</h3>' +
                // CSS line-clamp for card preview truncation (webkit-only)
                '<p style="font-size:14px; color:var(--cp-text-secondary); margin:0 0 12px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">' + n.body + '</p>' +
                '<button onclick="openNewsDetail(' + idx + ')" style="background:none; border:none; color:var(--cp-blue); font-size:14px; font-weight:600; padding:0; cursor:pointer;">Ler mais <i class="bi bi-arrow-right"></i></button>' +
            '</div>' +
        '</div>';
    }).join('');
}
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    var news = await API.getUserNews();
    renderNews(news);
})();
