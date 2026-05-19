AdminCRUD.init({
    table: 'badges',
    entityName: 'Badge',
    modalId: 'modalBadge',
    tbodyId: 'crudBody',
    searchColumn: 'name',
    renderRow: function(r) {
        var statusClass = r.is_active ? 'badge-active' : 'badge-inactive';
        var statusLabel = r.is_active ? 'Ativa' : 'Inativa';
        var exp = r.expiration_days ? r.expiration_days + ' dias' : 'Sem expiracao';
        return '<tr><td><strong>' + r.name + '</strong></td>' +
            '<td>' + (r.min_points || 0) + ' pts</td>' +
            '<td>' + exp + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + statusLabel + '</span></td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.name + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    },
    getFormData: function() {
        var name = document.getElementById('fName').value.trim();
        if (!name) { alert('Nome obrigatorio'); return null; }
        var expDays = document.getElementById('fExpDays').value;
        return {
            name: name,
            description: document.getElementById('fDesc').value.trim() || null,
            image_url: document.getElementById('fImageUrl').value.trim() || null,
            min_points: parseInt(document.getElementById('fMinPoints').value) || 0,
            expiration_days: expDays ? parseInt(expDays) : null,
            is_active: document.getElementById('fIsActive').value === 'true'
        };
    },
    fillForm: function(d) {
        document.getElementById('fName').value = d.name || '';
        document.getElementById('fDesc').value = d.description || '';
        document.getElementById('fImageUrl').value = d.image_url || '';
        document.getElementById('fMinPoints').value = d.min_points || '';
        document.getElementById('fExpDays').value = d.expiration_days || '';
        document.getElementById('fIsActive').value = d.is_active ? 'true' : 'false';
    },
    clearForm: function() {
        document.getElementById('fName').value = '';
        document.getElementById('fDesc').value = '';
        document.getElementById('fImageUrl').value = '';
        document.getElementById('fMinPoints').value = '';
        document.getElementById('fExpDays').value = '';
        document.getElementById('fIsActive').value = 'true';
    }
});
