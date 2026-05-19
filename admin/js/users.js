var regionsMap = {};
var sexLabel = { MASCULINO: 'Masculino', FEMININO: 'Feminino', GERAL: 'Geral' };
async function initUsers() {
    var user = await requireAdmin();
    if (!user) return;
    var regs = await API.list('regions', { limit: 100 });
    regs.data.forEach(function(r) { regionsMap[r.id] = r.name; });
    loadUsers();
    var searchInput = document.querySelector('.search-input input');
    if (searchInput) {
        var timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(loadUsers, 300);
        });
    }
}
async function loadUsers() {
    var tbody = document.getElementById('usersBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--cp-text-secondary);">Carregando...</td></tr>';
    var searchInput = document.querySelector('.search-input input');
    var search = searchInput ? searchInput.value.trim() : '';
    var options = { limit: 20, order: { column: 'total_points', ascending: false } };
    if (search) { options.search = search; options.searchColumn = 'full_name'; }
    var result = await API.list('profiles', options);
    var rows = result.data;
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--cp-text-secondary);">Nenhum usuario encontrado</td></tr>';
        return;
    }
    tbody.innerHTML = rows.map(function(r) {
        var adminBadge = r.is_admin
            ? '<span class="badge badge-active">Sim</span>'
            : '<span class="badge badge-inactive">Nao</span>';
        var toggleBtn = r.is_admin
            ? '<button class="btn btn-outline btn-sm btn-icon" title="Remover admin" onclick="toggleAdmin(\'' + r.id + '\', false)"><i class="bi bi-shield-x"></i></button>'
            : '<button class="btn btn-outline btn-sm btn-icon" title="Promover admin" onclick="toggleAdmin(\'' + r.id + '\', true)"><i class="bi bi-shield-check"></i></button>';
        return '<tr>' +
            '<td><strong>' + (r.full_name || '--') + '</strong></td>' +
            '<td>' + (r.id.substring(0, 8) + '...') + '</td>' +
            '<td>' + (sexLabel[r.biological_sex] || r.biological_sex || '--') + '</td>' +
            '<td>' + (regionsMap[r.region_id] || '--') + '</td>' +
            '<td><strong style="color:var(--cp-gold);">' + (r.total_points || 0) + '</strong></td>' +
            '<td>' + adminBadge + '</td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" title="Ver detalhes" onclick="viewUser(\'' + r.id + '\')"><i class="bi bi-eye"></i></button> ' +
                toggleBtn +
            '</td></tr>';
    }).join('');
}
async function toggleAdmin(userId, makeAdmin) {
    var action = makeAdmin ? 'promover a admin' : 'remover admin de';
    if (!confirm('Deseja ' + action + ' este usuario?')) return;
    var result = await API.update('profiles', userId, { is_admin: makeAdmin });
    if (result.error) {
        showToast('Erro: ' + result.error.message, 'error');
        return;
    }
    showToast(makeAdmin ? 'Usuario promovido a admin!' : 'Admin removido!', 'success');
    loadUsers();
}
async function viewUser(userId) {
    var u = await API.getById('profiles', userId);
    if (!u) return;
    var initials = (u.full_name || '??').split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
    var body = document.getElementById('modalUserBody');
    body.innerHTML =
        '<div style="display:flex;gap:16px;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--cp-border);">' +
            '<div style="width:48px;height:48px;border-radius:50%;background:var(--cp-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;">' + initials + '</div>' +
            '<div><div style="font-size:16px;font-weight:700;color:var(--cp-text-primary);">' + (u.full_name || '--') + '</div>' +
            '<div style="font-size:13px;color:var(--cp-text-secondary);">ID: ' + u.id.substring(0, 12) + '...</div></div>' +
        '</div>' +
        '<div class="form-row" style="margin-bottom:16px;">' +
            '<div><div style="font-size:12px;color:var(--cp-text-secondary);font-weight:600;">Sexo biologico</div><div style="font-size:14px;">' + (sexLabel[u.biological_sex] || '--') + '</div></div>' +
            '<div><div style="font-size:12px;color:var(--cp-text-secondary);font-weight:600;">Data nascimento</div><div style="font-size:14px;">' + (u.birth_date || '--') + '</div></div>' +
        '</div>' +
        '<div class="form-row" style="margin-bottom:16px;">' +
            '<div><div style="font-size:12px;color:var(--cp-text-secondary);font-weight:600;">Regiao</div><div style="font-size:14px;">' + (regionsMap[u.region_id] || '--') + '</div></div>' +
            '<div><div style="font-size:12px;color:var(--cp-text-secondary);font-weight:600;">Total de pontos</div><div style="font-size:18px;font-weight:700;color:var(--cp-gold);">' + (u.total_points || 0) + '</div></div>' +
        '</div>' +
        '<div class="form-row" style="margin-bottom:16px;">' +
            '<div><div style="font-size:12px;color:var(--cp-text-secondary);font-weight:600;">Admin</div><div style="font-size:14px;">' + (u.is_admin ? 'Sim' : 'Nao') + '</div></div>' +
            '<div><div style="font-size:12px;color:var(--cp-text-secondary);font-weight:600;">Cadastrado em</div><div style="font-size:14px;">' + new Date(u.created_at).toLocaleDateString('pt-BR') + '</div></div>' +
        '</div>';
    openModal('modalUser');
}
initUsers();
