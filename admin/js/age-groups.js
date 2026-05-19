AdminCRUD.init({
    table: 'age_groups',
    entityName: 'Faixa Etaria',
    modalId: 'modalAgeGroup',
    tbodyId: 'crudBody',
    searchColumn: 'name',
    order: { column: 'min_age', ascending: true },
    renderRow: function(r) {
        return '<tr><td><strong>' + r.name + '</strong></td>' +
            '<td>' + r.min_age + ' anos</td>' +
            '<td>' + r.max_age + ' anos</td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.name + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    },
    getFormData: function() {
        var name = document.getElementById('fName').value.trim();
        var minAge = document.getElementById('fMinAge').value;
        var maxAge = document.getElementById('fMaxAge').value;
        if (!name) { alert('Nome obrigatorio'); return null; }
        if (minAge === '' || maxAge === '') { alert('Idades obrigatorias'); return null; }
        return { name: name, min_age: parseInt(minAge), max_age: parseInt(maxAge) };
    },
    fillForm: function(d) {
        document.getElementById('fName').value = d.name || '';
        document.getElementById('fMinAge').value = d.min_age != null ? d.min_age : '';
        document.getElementById('fMaxAge').value = d.max_age != null ? d.max_age : '';
    },
    clearForm: function() {
        document.getElementById('fName').value = '';
        document.getElementById('fMinAge').value = '';
        document.getElementById('fMaxAge').value = '';
    }
});
