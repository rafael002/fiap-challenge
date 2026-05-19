function toggleSidebar() {
    document.querySelector('.cp-sidebar').classList.toggle('open');
    document.querySelector('.cp-sidebar-overlay').classList.toggle('open');
}
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    var data = await API.getHomeData();
    if (!data) return;
    // Greeting
    if (data.profile) {
        var firstName = data.profile.full_name.split(' ')[0];
        document.getElementById('greeting').textContent = 'Ola, ' + firstName + '!';
    }
    // Points
    var pointsEl = document.getElementById('totalPoints');
    var pts = data.profile ? data.profile.total_points : 0;
    pointsEl.dataset.points = pts;
    // GSAP counter animation, 1200ms duration
    animateCounter(pointsEl, pts, 1200);
    // Ranking info
    var rankInfo = document.getElementById('rankingInfo');
    var rr = data.ranking_regional;
    var rg = data.ranking_global;
    if (rr || rg) {
        rankInfo.innerHTML = '<i class="bi bi-trophy-fill"></i> ' +
            (rr ? '<strong>' + rr.position + 'º lugar</strong> no ranking regional' : '') +
            (rr && rg ? ' &bull; ' : '') +
            (rg ? '<strong>' + rg.position + 'º</strong> no geral' : '');
    } else {
        rankInfo.innerHTML = '<i class="bi bi-trophy-fill"></i> Sem posicao no ranking ainda';
    }
    // Appointments
    var apptList = document.getElementById('appointmentsList');
    if (data.appointments && data.appointments.length > 0) {
        apptList.innerHTML = data.appointments.map(function(a, i) {
            var isExam = a.type === 'EXAM';
            return '<div class="cp-appointment-card animate-slide-up stagger-' + (i + 1) + '">' +
                '<div class="d-flex gap-3 align-items-start">' +
                    '<div class="appt-icon ' + (isExam ? 'exam' : 'consultation') + '">' +
                        '<i class="bi bi-' + (isExam ? 'clipboard2-pulse' : 'heart-pulse') + '"></i>' +
                    '</div>' +
                    '<div class="flex-grow-1">' +
                        '<div class="appt-title">' + a.title + '</div>' +
                        '<div class="appt-doctor">' + (a.doctor_name || '') + '</div>' +
                        '<div class="appt-datetime">' +
                            '<i class="bi bi-calendar3"></i> ' + formatDateTime(a.scheduled_at) +
                            (a.location ? ' &bull; <i class="bi bi-geo-alt"></i> ' + a.location : '') +
                        '</div>' +
                        '<a href="agendamentos.html" class="appt-link">Ver detalhes</a>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    } else {
        apptList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--cp-text-secondary);font-size:14px;">' +
            '<i class="bi bi-calendar-x" style="font-size:24px;display:block;margin-bottom:8px;"></i>Nenhum agendamento proximo</div>';
    }
    // Challenges
    var challList = document.getElementById('challengesList');
    if (data.challenges && data.challenges.length > 0) {
        challList.innerHTML = data.challenges.map(function(c, i) {
            var pct = c.total_steps > 0 ? Math.round((c.completed_steps / c.total_steps) * 100) : 0;
            return '<div class="cp-challenge-card animate-slide-up stagger-' + (i + 3) + '">' +
                '<div class="challenge-header">' +
                    '<div class="challenge-icon"><i class="bi bi-award"></i></div>' +
                    '<div class="flex-grow-1">' +
                        '<div class="challenge-title">' + c.name + '</div>' +
                        '<div class="challenge-subtitle">' + c.total_steps + ' etapas &bull; Bonus: ' + c.bonus_points + ' pts</div>' +
                    '</div>' +
                '</div>' +
                '<div class="challenge-progress">' +
                    '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">' +
                        '<div class="progress-bar" style="width: ' + pct + '%"></div>' +
                    '</div>' +
                    '<div class="challenge-stats">' +
                        '<span>' + c.completed_steps + ' de ' + c.total_steps + ' etapas concluidas</span>' +
                        '<span class="challenge-points"><i class="bi bi-star-fill"></i> ' + formatPoints(c.earned_points) + ' pts</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    } else {
        challList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--cp-text-secondary);font-size:14px;">' +
            '<i class="bi bi-shield-x" style="font-size:24px;display:block;margin-bottom:8px;"></i>Nenhum desafio ativo. <a href="desafios.html">Explorar desafios</a></div>';
    }
    // Ranking preview
    var rankList = document.getElementById('rankingPreview');
    var userRegionId = data.profile ? data.profile.region_id : null;
    // Fetch top 3 from user's region for home preview
    var rankings = await API.getRankings('REGIONAL', 3, 0, userRegionId);
    if (rankings && rankings.length > 0) {
        var posClasses = ['gold', 'silver', 'bronze'];
        var html = rankings.map(function(r, i) {
            return '<div class="cp-ranking-item">' +
                '<div class="rank-position ' + (posClasses[i] || '') + '">' + r.rank_position + 'º</div>' +
                '<div class="rank-avatar">' + getInitials(r.full_name) + '</div>' +
                '<div class="rank-name">' + r.full_name.split(' ')[0] + '</div>' +
                '<div class="rank-points"><i class="bi bi-star-fill"></i> ' + formatPoints(r.total_points) + '</div>' +
            '</div>';
        }).join('');
        // Add current user position
        if (rr) {
            html += '<div class="cp-ranking-item me">' +
                '<div class="rank-position">' + rr.position + 'º</div>' +
                '<div class="rank-avatar" style="background: var(--cp-blue); color: #fff;">' + getInitials(data.profile.full_name) + '</div>' +
                '<div class="rank-name">Voce (' + data.profile.full_name.split(' ')[0] + ')</div>' +
                '<div class="rank-points"><i class="bi bi-star-fill"></i> ' + formatPoints(data.profile.total_points) + '</div>' +
            '</div>';
        }
        rankList.innerHTML = html;
    } else {
        rankList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--cp-text-secondary);font-size:14px;">' +
            'Ranking ainda nao disponivel</div>';
    }
})();
