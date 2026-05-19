function toggleSidebar() { document.querySelector('.cp-sidebar').classList.toggle('open'); document.querySelector('.cp-sidebar-overlay').classList.toggle('open'); }
document.querySelectorAll('.cp-tab').forEach(tab => { tab.addEventListener('click', () => { document.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active')); document.querySelectorAll('.cp-tab-content').forEach(c => c.classList.remove('active')); tab.classList.add('active'); document.getElementById('tab-' + tab.dataset.tab).classList.add('active'); }); });
function renderRankingList(rankings, currentUserId) {
    if (!rankings || rankings.length === 0) return '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);">Ranking ainda nao disponivel</div>';
    var posClasses = ['gold', 'silver', 'bronze'];
    return rankings.map(function(r) {
        var isMe = r.user_id === currentUserId;
        var posClass = r.rank_position <= 3 ? posClasses[r.rank_position - 1] : '';
        var avatarStyle = isMe ? ' style="background:var(--cp-blue);color:#fff;"' : (r.rank_position === 1 ? ' style="background:#FEF3C7;color:#D97706;"' : '');
        return '<div class="cp-ranking-item' + (isMe ? ' me' : '') + '">' +
            '<div class="rank-position ' + posClass + '">' + r.rank_position + 'º</div>' +
            '<div class="rank-avatar"' + avatarStyle + '>' + getInitials(r.full_name) + '</div>' +
            '<div class="rank-name">' + (isMe ? 'Voce (' + r.full_name.split(' ')[0] + ')' : r.full_name) + '</div>' +
            '<div class="rank-points"><i class="bi bi-star-fill"></i> ' + formatPoints(r.total_points) + '</div></div>';
    }).join('');
}
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    var profile = await getCurrentProfile();
    var regionId = profile ? profile.region_id : null;
    var regional = regionId ? await API.getRankings('REGIONAL', 20, 0, regionId) : [];
    var global = await API.getRankings('GLOBAL', 20);
    // Podium (from regional, or global if no regional)
    // Fallback: use global ranking for podium if regional has < 3 users
    var podiumData = (regional && regional.length >= 3) ? regional : global;
    if (podiumData && podiumData.length >= 3) {
        for (var i = 1; i <= 3; i++) {
            var p = podiumData[i - 1];
            document.getElementById('podium' + i + 'avatar').textContent = getInitials(p.full_name);
            document.getElementById('podium' + i + 'name').textContent = p.full_name.split(' ')[0];
            document.getElementById('podium' + i + 'pts').textContent = formatPoints(p.total_points) + ' pts';
        }
    }
    document.getElementById('regionalList').innerHTML = renderRankingList(regional, user.id);
    document.getElementById('globalList').innerHTML = renderRankingList(global, user.id);
})();
