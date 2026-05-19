function toggleSidebar() { document.querySelector('.cp-sidebar').classList.toggle('open'); document.querySelector('.cp-sidebar-overlay').classList.toggle('open'); }
document.querySelectorAll('.cp-tab').forEach(tab => { tab.addEventListener('click', () => { document.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active')); document.querySelectorAll('.cp-tab-content').forEach(c => c.classList.remove('active')); tab.classList.add('active'); document.getElementById('tab-' + tab.dataset.tab).classList.add('active'); }); });
function renderStepTimeline(steps) {
    if (!steps || steps.length === 0) return '';
    return '<div class="challenge-steps">' + steps.map(function(s, i) {
        var isFinished = s.status === 'FINISHED';
        var isActive = s.status === 'ACTIVE';
        var stepClass = isFinished ? 'completed' : (isActive ? 'active-step' : '');
        var circleClass = isFinished ? 'completed' : (isActive ? 'active animate-pulse' : '');
        var circleContent = isFinished ? '<i class="bi bi-check-lg"></i>' : '<span>' + (i + 1) + '</span>';
        var lineClass = isFinished ? 'completed' : (isActive ? 'active' : '');
        var pointsClass = isFinished ? 'earned' : '';
        var pointsIcon = isFinished ? 'bi-star-fill' : 'bi-star';
        var badge = isFinished ? '<span class="cp-badge finished"><i class="bi bi-check-circle-fill"></i> Concluido</span>' :
                    isActive ? '<span class="cp-badge active"><i class="bi bi-play-circle"></i> Em andamento</span>' :
                    '<span class="cp-badge waiting"><i class="bi bi-clock"></i> Pendente</span>';
        var line = i < steps.length - 1 ? '<div class="step-line ' + lineClass + '"></div>' : '';
        var subStepsHtml = '';
        if (s.sub_steps && s.sub_steps.length > 0) {
            subStepsHtml = '<div class="sub-steps-list" style="margin-top:8px;padding-left:4px;">' + s.sub_steps.map(function(ss) {
                var ssFinished = ss.status === 'FINISHED';
                var ssActive = ss.status === 'ACTIVE';
                var ssIcon = ssFinished ? 'bi-check-circle-fill' : (ssActive ? 'bi-circle-half' : 'bi-circle');
                var ssColor = ssFinished ? 'var(--cp-green)' : (ssActive ? 'var(--cp-blue)' : 'var(--cp-text-secondary)');
                var procsHtml = '';
                if (ss.procedures && ss.procedures.length > 0) {
                    procsHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;padding-left:22px;">' +
                        ss.procedures.map(function(p) {
                            var typeIcon = p.type === 'APPOINTMENT' ? 'bi-calendar-check' : p.type === 'EXAM' ? 'bi-clipboard2-pulse' : p.type === 'VACCINE' ? 'bi-shield-plus' : 'bi-tag';
                            var reqBadge = p.required ? ' *' : '';
                            return '<span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;padding:2px 7px;border-radius:10px;background:var(--cp-blue-light);color:var(--cp-blue);">' +
                                '<i class="bi ' + typeIcon + '"></i> ' + p.name + reqBadge + '</span>';
                        }).join('') +
                    '</div>';
                }
                return '<div style="padding:4px 0;">' +
                    '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
                        '<i class="bi ' + ssIcon + '" style="color:' + ssColor + ';font-size:14px;flex-shrink:0;"></i>' +
                        '<span style="color:' + (ssFinished ? 'var(--cp-text-secondary)' : 'var(--cp-text-body)') + ';' + (ssFinished ? 'text-decoration:line-through;' : '') + '">' + ss.name + '</span>' +
                    '</div>' +
                    procsHtml +
                '</div>';
            }).join('') + '</div>';
        }
        return '<div class="cp-step ' + stepClass + '">' +
            '<div class="step-indicator"><div class="step-circle ' + circleClass + '">' + circleContent + '</div>' + line + '</div>' +
            '<div class="step-content">' +
                '<div class="step-header"><span class="step-title">' + s.name + '</span><span class="step-points ' + pointsClass + '"><i class="bi ' + pointsIcon + '"></i> ' + s.points + ' pts</span></div>' +
                (s.description ? '<p class="step-desc">' + s.description + '</p>' : '') +
                badge +
                subStepsHtml +
            '</div></div>';
    }).join('') + '</div>';
}
function formatExpiry(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var now = new Date();
    var diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '<span style="color:var(--cp-red);font-size:12px;"><i class="bi bi-exclamation-triangle"></i> Expirado</span>';
    if (diff <= 7) return '<span style="color:var(--cp-orange);font-size:12px;"><i class="bi bi-clock-history"></i> ' + diff + ' dias restantes</span>';
    return '<span style="color:var(--cp-text-secondary);font-size:12px;"><i class="bi bi-calendar3"></i> Ate ' + d.toLocaleDateString('pt-BR') + '</span>';
}
function renderActiveChallenge(c) {
    var pct = c.total_steps > 0 ? Math.round((c.completed_steps / c.total_steps) * 100) : 0;
    var cardId = 'active-card-' + c.challenge_id;
    var expiry = c.expires_at ? '<div style="margin-top:2px;">' + formatExpiry(c.expires_at) + '</div>' : '';
    return '<div class="cp-challenge-card" style="margin-top:4px;cursor:pointer;" onclick="toggleChallengeSteps(\'' + cardId + '\')">' +
        '<div class="challenge-header"><div class="challenge-icon"><i class="bi bi-award"></i></div>' +
        '<div class="flex-grow-1"><div class="challenge-title">' + c.name + '</div><div class="challenge-subtitle">' + c.total_steps + ' etapas &bull; Bonus: ' + c.bonus_points + ' pts</div>' + expiry + '</div>' +
        '<i class="bi bi-chevron-down toggle-icon" style="color:var(--cp-text-secondary);transition:transform 0.2s;"></i></div>' +
        '<div class="challenge-progress"><div class="progress" role="progressbar" aria-valuenow="' + pct + '"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="challenge-stats"><span>' + c.completed_steps + ' de ' + c.total_steps + ' etapas</span><span class="challenge-points"><i class="bi bi-star-fill"></i> ' + formatPoints(c.earned_points) + ' pts</span></div></div>' +
        '<div class="challenge-steps-collapse" id="' + cardId + '" style="display:none;">' + renderStepTimeline(c.steps) + '</div>' +
        (c.completed_steps === c.total_steps && c.total_steps > 0 ?
            '<button class="btn w-100" style="margin-top:10px;background:var(--cp-green);color:#fff;" onclick="event.stopPropagation();completeChallenge(\'' + c.user_challenge_id + '\',' + c.bonus_points + ')"><i class="bi bi-trophy-fill me-1"></i>Completar desafio e ganhar ' + c.bonus_points + ' pts!</button>' : '') +
        '</div>';
}
function toggleChallengeSteps(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var card = el.closest('.cp-challenge-card');
    var icon = card.querySelector('.toggle-icon');
    if (el.style.display === 'none') {
        el.style.display = '';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        el.style.display = 'none';
        if (icon) icon.style.transform = '';
    }
}
// Lazy-loads step hierarchy (steps -> sub_steps -> procedures) on first expand
async function loadAvailableSteps(challengeId, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (el.dataset.loaded) { toggleChallengeSteps(containerId); return; }
    el.innerHTML = '<div style="text-align:center;padding:12px;color:var(--cp-text-secondary);font-size:13px;">Carregando etapas...</div>';
    el.style.display = '';
    var card = el.closest('.cp-challenge-card');
    var icon = card.querySelector('.toggle-icon');
    if (icon) icon.style.transform = 'rotate(180deg)';
    var steps = await API.list('steps', { filters: { challenge_id: challengeId }, order: { column: 'step_order', ascending: true }, limit: 50 });
    if (steps.data && steps.data.length > 0) {
        var stepsWithSubs = [];
        for (var i = 0; i < steps.data.length; i++) {
            var s = steps.data[i];
            var subs = await API.list('sub_steps', { filters: { step_id: s.id }, order: { column: 'sub_step_order', ascending: true }, limit: 50 });
            var subStepsData = [];
            for (var j = 0; j < subs.data.length; j++) {
                var ss = subs.data[j];
                var procs = await API.list('sub_step_procedures', { filters: { sub_step_id: ss.id }, limit: 50 });
                var procIds = procs.data.map(function(p) { return p.procedure_id; });
                var procDetails = [];
                for (var k = 0; k < procs.data.length; k++) {
                    var proc = await API.getById('procedures', procs.data[k].procedure_id);
                    if (proc) procDetails.push({ name: proc.name, type: proc.type, required: procs.data[k].required });
                }
                subStepsData.push({ name: ss.name, status: 'WAITING', procedures: procDetails });
            }
            stepsWithSubs.push({
                name: s.name, description: s.description, points: s.points, status: 'WAITING',
                sub_steps: subStepsData
            });
        }
        el.innerHTML = renderStepTimeline(stepsWithSubs);
    } else {
        el.innerHTML = '<div style="text-align:center;padding:12px;color:var(--cp-text-secondary);font-size:13px;">Nenhuma etapa cadastrada</div>';
    }
    // Cache flag to avoid re-fetching on subsequent toggles
    el.dataset.loaded = '1';
}
function launchConfetti() {
    var colors = ['#0079C8', '#2EAD6D', '#F59E0B', '#EF4444', '#8B5CF6'];
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);
    for (var i = 0; i < 80; i++) {
        var c = document.createElement('div');
        var size = Math.random() * 8 + 4;
        c.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;background:' + colors[Math.floor(Math.random() * colors.length)] +
            ';border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';left:' + (Math.random() * 100) + '%;top:-10px;opacity:1;';
        container.appendChild(c);
        var duration = Math.random() * 1500 + 1500;
        var drift = (Math.random() - 0.5) * 200;
        c.animate([
            { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
            { transform: 'translateY(' + (window.innerHeight + 50) + 'px) translateX(' + drift + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 0 }
        ], { duration: duration, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
    }
    setTimeout(function() { container.remove(); }, 3500);
}
// Calls RPC directly (not via API layer) to complete challenge and award bonus
async function completeChallenge(userChallengeId, bonus) {
    var user = await getCurrentUser();
    if (!user) return;
    var result = await supabase.rpc('complete_challenge', { p_user_id: user.id, p_user_challenge_id: userChallengeId });
    if (result.data && result.data.success) {
        launchConfetti();
        showToast('Desafio concluido! Voce ganhou ' + bonus + ' pontos de bonus!', 'success');
        loadChallenges();
    } else {
        showToast(result.data ? result.data.error : 'Erro ao completar desafio', 'error');
    }
}
async function acceptChallenge(challengeId) {
    var result = await API.acceptChallenge(challengeId);
    if (result && result.success) {
        showToast('Desafio aceito!', 'success');
        loadChallenges();
    } else {
        showToast(result ? result.error : 'Erro ao aceitar desafio', 'error');
    }
}
async function loadChallenges() {
    var userChallenges = await API.getUserChallenges();
    var available = await API.getAvailableChallenges();
    // Active
    var activeEl = document.getElementById('activeChallengesList');
    var active = (userChallenges || []).filter(function(c) { return c.status === 'ACTIVE' || c.status === 'ACCEPTED'; });
    if (active.length > 0) {
        activeEl.innerHTML = active.map(function(c) { return renderActiveChallenge(c); }).join('');
    } else {
        activeEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);"><i class="bi bi-shield-x" style="font-size:24px;display:block;margin-bottom:8px;"></i>Nenhum desafio ativo. Explore os disponiveis!</div>';
    }
    // Available
    var availEl = document.getElementById('availableChallengesList');
    if (available && available.length > 0) {
        availEl.innerHTML = available.map(function(c) {
            var collapseId = 'avail-card-' + c.id;
            return '<div class="cp-challenge-card">' +
                '<div class="challenge-header" style="cursor:pointer;" onclick="loadAvailableSteps(\'' + c.id + '\',\'' + collapseId + '\')">' +
                    '<div class="challenge-icon"><i class="bi bi-shield-check"></i></div>' +
                    '<div class="flex-grow-1"><div class="challenge-title">' + c.name + '</div>' +
                    '<div class="challenge-subtitle">' + c.total_steps + ' etapas &bull; Total: ' + formatPoints(c.total_points) + ' pts + ' + c.bonus_points + ' bonus</div>' + (c.expires_at ? '<div style="margin-top:2px;">' + formatExpiry(c.expires_at) + '</div>' : '') + '</div>' +
                    '<i class="bi bi-chevron-down toggle-icon" style="color:var(--cp-text-secondary);transition:transform 0.2s;"></i>' +
                '</div>' +
                (c.description ? '<p style="font-size:13px;color:var(--cp-text-secondary);margin:8px 0;">' + c.description + '</p>' : '') +
                '<div class="challenge-steps-collapse" id="' + collapseId + '" style="display:none;"></div>' +
                '<button class="btn btn-cp-cta btn-sm w-100" onclick="event.stopPropagation();acceptChallenge(\'' + c.id + '\')"><i class="bi bi-plus-circle me-1"></i>Aceitar desafio</button></div>';
        }).join('');
    } else {
        availEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);">Nenhum desafio disponivel no momento</div>';
    }
    // Completed
    var compEl = document.getElementById('completedChallengesList');
    var completed = (userChallenges || []).filter(function(c) { return c.status === 'FINISHED'; });
    if (completed.length > 0) {
        compEl.innerHTML = completed.map(function(c) {
            var cardId = 'comp-card-' + c.challenge_id;
            return '<div class="cp-challenge-card" style="opacity:0.8;cursor:pointer;" onclick="toggleChallengeSteps(\'' + cardId + '\')">' +
                '<div class="challenge-header"><div class="challenge-icon" style="background:var(--cp-green-light);color:var(--cp-green);"><i class="bi bi-trophy-fill"></i></div>' +
                '<div class="flex-grow-1"><div class="challenge-title">' + c.name + '</div>' +
                '<div class="challenge-subtitle">Concluido em ' + formatDate(c.completed_at) + '</div></div>' +
                '<i class="bi bi-chevron-down toggle-icon" style="color:var(--cp-text-secondary);transition:transform 0.2s;"></i></div>' +
                '<div class="challenge-progress"><div class="progress" role="progressbar" aria-valuenow="100"><div class="progress-bar" style="width:100%;background:var(--cp-green);"></div></div>' +
                '<div class="challenge-stats"><span>' + c.total_steps + ' de ' + c.total_steps + ' etapas</span><span class="challenge-points"><i class="bi bi-star-fill"></i> ' + formatPoints(c.earned_points) + ' pts ganhos</span></div></div>' +
                '<div class="challenge-steps-collapse" id="' + cardId + '" style="display:none;">' + renderStepTimeline(c.steps) + '</div></div>';
        }).join('');
    } else {
        compEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);">Nenhum desafio concluido ainda</div>';
    }
    // Expired
    var expEl = document.getElementById('expiredChallengesList');
    var expired = (userChallenges || []).filter(function(c) { return c.status === 'EXPIRED'; });
    if (expired.length > 0) {
        expEl.innerHTML = expired.map(function(c) {
            var pct = c.total_steps > 0 ? Math.round((c.completed_steps / c.total_steps) * 100) : 0;
            var cardId = 'exp-card-' + c.challenge_id;
            return '<div class="cp-challenge-card" style="opacity:0.7;cursor:pointer;" onclick="toggleChallengeSteps(\'' + cardId + '\')">' +
                '<div class="challenge-header"><div class="challenge-icon" style="background:#FEE2E2;color:var(--cp-red);"><i class="bi bi-clock-history"></i></div>' +
                '<div class="flex-grow-1"><div class="challenge-title">' + c.name + '</div>' +
                '<div class="challenge-subtitle">' + c.completed_steps + ' de ' + c.total_steps + ' etapas completadas</div>' +
                (c.expires_at ? '<div style="margin-top:2px;">' + formatExpiry(c.expires_at) + '</div>' : '') + '</div>' +
                '<i class="bi bi-chevron-down toggle-icon" style="color:var(--cp-text-secondary);transition:transform 0.2s;"></i></div>' +
                '<div class="challenge-progress"><div class="progress" role="progressbar" aria-valuenow="' + pct + '"><div class="progress-bar" style="width:' + pct + '%;background:var(--cp-red);"></div></div>' +
                '<div class="challenge-stats"><span>' + formatPoints(c.earned_points) + ' pts conquistados</span></div></div>' +
                '<div class="challenge-steps-collapse" id="' + cardId + '" style="display:none;">' + renderStepTimeline(c.steps) + '</div></div>';
        }).join('');
    } else {
        expEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);">Nenhum desafio expirado</div>';
    }
}
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    await loadChallenges();
})();
