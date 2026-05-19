AdminCRUD.init({
    table: 'specialties',
    entityName: 'Especialidade',
    modalId: 'modalSpecialty',
    tbodyId: 'crudBody',
    searchColumn: 'name',
    renderRow: function(r) {
        return '<tr><td><strong>' + r.name + '</strong></td>' +
            '<td>' + (r.description || '--') + '</td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.name + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    },
    getFormData: function() {
        var name = document.getElementById('fName').value.trim();
        if (!name) { alert('Nome obrigatorio'); return null; }
        return { name: name, description: document.getElementById('fDesc').value.trim() || null };
    },
    fillForm: function(d) {
        document.getElementById('fName').value = d.name || '';
        document.getElementById('fDesc').value = d.description || '';
    },
    clearForm: function() {
        document.getElementById('fName').value = '';
        document.getElementById('fDesc').value = '';
    }
});
