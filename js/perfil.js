function toggleSidebar() { document.querySelector('.cp-sidebar').classList.toggle('open'); document.querySelector('.cp-sidebar-overlay').classList.toggle('open'); }
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    var data = await API.getUserProfile();
    if (!data) return;
    var p = data.profile;
    document.getElementById('profileAvatar').textContent = getInitials(p.full_name);
    document.getElementById('profileName').textContent = p.full_name;
    document.getElementById('profileInfo').textContent = 'Regiao: ' + (p.region_name || '--') + ' | ' + (p.age_group || '') + ' (' + p.age + ' anos)';
    document.getElementById('statPoints').textContent = formatPoints(p.total_points);
    document.getElementById('statChallenges').textContent = data.stats.total_challenges_completed;
    document.getElementById('statBadges').textContent = data.stats.total_badges;
    // Ranking position
    var rankings = await API.getRankings('REGIONAL', 100);
    var myRank = rankings ? rankings.find(function(r) { return r.user_id === user.id; }) : null;
    document.getElementById('statRanking').textContent = myRank ? myRank.rank_position + 'º' : '--';
    // Badges
    var badgesEl = document.getElementById('badgesList');
    var colors = ['#F59E0B,#D97706', '#0079C8,#005A96', '#2EAD6D,#248F59', '#7C3AED,#5B21B6', '#EF4444,#DC2626'];
    var icons = ['bi-heart-pulse-fill', 'bi-shield-fill-check', 'bi-trophy-fill', 'bi-star-fill', 'bi-award-fill'];
    if (data.badges && data.badges.length > 0) {
        // Store in window for share modal to access later
        window._badges = data.badges;
        window._userName = p.full_name;
        window._userPoints = p.total_points;
        badgesEl.innerHTML = data.badges.map(function(b, i) {
            var c = colors[i % colors.length].split(',');
            var ic = icons[i % icons.length];
            // Days until badge expiration (86400000ms = 1 day)
            var expDays = b.expires_at ? Math.ceil((new Date(b.expires_at) - new Date()) / 86400000) : null;
            var expText = expDays !== null ? (expDays > 0 ? 'Exp: ' + expDays + ' dias' : 'Expirada') : 'Permanente';
            return '<div class="badge-item" onclick="openShareModal(' + i + ')" style="cursor:pointer;"><div class="badge-icon" style="background:linear-gradient(135deg,' + c[0] + ',' + c[1] + ');"><i class="bi ' + ic + '"></i></div><span class="badge-label">' + b.name + '</span><span class="badge-exp">' + expText + '</span></div>';
        }).join('');
    } else {
        badgesEl.innerHTML = '<div style="padding:16px;color:var(--cp-text-secondary);font-size:13px;">Nenhuma badge conquistada ainda</div>';
    }
    // Points history
    var phEl = document.getElementById('pointsHistory');
    if (data.points_history && data.points_history.length > 0) {
        phEl.innerHTML = data.points_history.map(function(ph) {
            var isPos = ph.points >= 0;
            return '<div class="points-item ' + (isPos ? 'positive' : 'negative') + '">' +
                '<div class="points-item-icon"><i class="bi bi-' + (isPos ? 'plus' : 'dash') + '-circle-fill"></i></div>' +
                '<div class="points-item-info"><div class="points-item-title">' + (ph.description || ph.reason) + '</div><div class="points-item-date">' + formatDate(ph.created_at) + '</div></div>' +
                '<div class="points-item-value">' + (isPos ? '+' : '') + ph.points + '</div></div>';
        }).join('');
    } else {
        phEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--cp-text-secondary);">Nenhum historico de pontos</div>';
    }
})();
function openShareModal(index) {
    var b = window._badges[index];
    var colors = ['#F59E0B,#D97706', '#0079C8,#005A96', '#2EAD6D,#248F59', '#7C3AED,#5B21B6', '#EF4444,#DC2626'];
    var icons = ['bi-heart-pulse-fill', 'bi-shield-fill-check', 'bi-trophy-fill', 'bi-star-fill', 'bi-award-fill'];
    var c = colors[index % colors.length].split(',');
    var ic = icons[index % icons.length];
    document.getElementById('shareCardBadge').innerHTML = '<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,' + c[0] + ',' + c[1] + ');display:flex;align-items:center;justify-content:center;margin:0 auto;"><i class="bi ' + ic + '" style="font-size:28px;color:#fff;"></i></div>';
    document.getElementById('shareCardName').textContent = b.name;
    document.getElementById('shareCardDesc').textContent = b.description || '';
    document.getElementById('shareCardUser').textContent = window._userName;
    document.getElementById('shareCardPoints').textContent = formatPoints(window._userPoints) + ' pontos';
    document.getElementById('shareOverlay').classList.add('open');
    document.getElementById('btnShareNative').style.display = navigator.share ? '' : 'none';
}
function closeShareModal() {
    document.getElementById('shareOverlay').classList.remove('open');
}
async function shareNative() {
    var b = document.getElementById('shareCardName').textContent;
    var text = 'Conquistei a badge "' + b + '" no Care Plus! Ja tenho ' + document.getElementById('shareCardPoints').textContent + '. #CarePlus #SaudePreventiva';
    try {
        await navigator.share({ title: 'Care Plus - Badge', text: text });
    } catch(e) {}
}
async function copyShareCard() {
    try {
        var el = document.getElementById('shareCard');
        // Render share card as 2x image for retina quality
        var canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
        canvas.toBlob(function(blob) {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast('Imagem copiada!', 'success');
        });
    } catch(e) {
        // Fallback: copy text
        var text = 'Conquistei a badge "' + document.getElementById('shareCardName').textContent + '" no Care Plus! ' + document.getElementById('shareCardPoints').textContent;
        navigator.clipboard.writeText(text);
        showToast('Texto copiado!', 'success');
    }
}
