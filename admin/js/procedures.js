var typeBadge = { EXAM: 'badge-active', APPOINTMENT: 'badge-info', VACCINE: 'badge-success', OTHER: 'badge-warning' };
var typeLabel = { EXAM: 'Exame', APPOINTMENT: 'Consulta', VACCINE: 'Vacina', OTHER: 'Outro' };
AdminCRUD.init({
    table: 'procedures',
    entityName: 'Procedimento',
    modalId: 'modalProcedure',
    tbodyId: 'crudBody',
    searchColumn: 'name',
    renderRow: function(r) {
        return '<tr><td><strong>' + r.name + '</strong></td>' +
            '<td><span class="badge ' + (typeBadge[r.type] || '') + '">' + (typeLabel[r.type] || r.type) + '</span></td>' +
            '<td>' + (r.description || '--') + '</td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.name + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    },
    getFormData: function() {
        var name = document.getElementById('fName').value.trim();
        if (!name) { alert('Nome obrigatorio'); return null; }
        return { name: name, type: document.getElementById('fType').value, description: document.getElementById('fDesc').value.trim() || null };
    },
    fillForm: function(d) {
        document.getElementById('fName').value = d.name || '';
        document.getElementById('fType').value = d.type || 'EXAM';
        document.getElementById('fDesc').value = d.description || '';
    },
    clearForm: function() {
        document.getElementById('fName').value = '';
        document.getElementById('fType').value = 'EXAM';
        document.getElementById('fDesc').value = '';
    }
});
