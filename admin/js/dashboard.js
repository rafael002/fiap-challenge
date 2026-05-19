(async function() {
    var user = await requireAdmin();
    if (!user) return;
    var data = await API.getAdminStats();
    if (!data) return;
    // Stats cards
    document.getElementById('statUsers').textContent = (data.total_users || 0).toLocaleString('pt-BR');
    document.getElementById('statChallenges').textContent = data.total_challenges || 0;
    // Sum of appointments + exams for current month
    document.getElementById('statAppointments').textContent =
        ((data.total_appointments_month || 0) + (data.total_exams_month || 0)).toLocaleString('pt-BR');
    document.getElementById('statPoints').textContent = (data.total_points_distributed || 0).toLocaleString('pt-BR');
    // Top users
    var topBody = document.getElementById('topUsersBody');
    if (data.top_users && data.top_users.length > 0) {
        topBody.innerHTML = data.top_users.map(function(u, i) {
            return '<tr><td>' + (i + 1) + '</td><td>' + u.full_name + '</td><td><strong>' +
                (u.total_points || 0).toLocaleString('pt-BR') + '</strong></td></tr>';
        }).join('');
    } else {
        topBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum usuario com pontos</td></tr>';
    }
    // Recent activity
    var actBody = document.getElementById('activityBody');
    if (data.recent_activity && data.recent_activity.length > 0) {
        var reasonBadge = {
            'ATTENDANCE': '<span class="badge badge-info">Consulta realizada</span>',
            'CANCEL_EARLY': '<span class="badge badge-warning">Cancelamento antecipado</span>',
            'CANCEL_LATE': '<span class="badge badge-danger">Cancelamento tardio</span>',
            'NO_SHOW': '<span class="badge badge-danger">No-show</span>',
            'STEP_COMPLETE': '<span class="badge badge-active">Etapa concluida</span>',
            'CHALLENGE_COMPLETE': '<span class="badge badge-active">Desafio concluido</span>',
            'CHALLENGE_BONUS': '<span class="badge badge-active">Bonus desafio</span>'
        };
        actBody.innerHTML = data.recent_activity.map(function(a) {
            return '<tr>' +
                '<td>' + (reasonBadge[a.reason] || a.reason) + '</td>' +
                '<td>' + a.full_name + '</td>' +
                '<td>' + (a.description || '--') + ' (' + (a.points > 0 ? '+' : '') + a.points + ' pts)</td>' +
                '<td>' + formatDateTime(a.created_at) + '</td>' +
            '</tr>';
        }).join('');
    } else {
        actBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma atividade recente</td></tr>';
    }
    // Active challenges
    var challBody = document.getElementById('activeChallengesBody');
    var challResult = await API.list('challenges', { filters: { is_active: true }, limit: 5 });
    if (challResult.data.length > 0) {
        challBody.innerHTML = challResult.data.map(function(c) {
            return '<tr><td>' + c.name + '</td><td>' + (c.bonus_points || 0) + ' pts</td></tr>';
        }).join('');
    } else {
        challBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Nenhum desafio ativo</td></tr>';
    }
})();
