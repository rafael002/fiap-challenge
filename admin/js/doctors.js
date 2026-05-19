var specialtiesMap = {};
var regionsMap = {};
async function loadSelectOptions() {
    var specs = await API.list('specialties', { limit: 100, order: { column: 'name', ascending: true } });
    var regs = await API.list('regions', { limit: 100, order: { column: 'name', ascending: true } });
    var selSpec = document.getElementById('fSpecialty');
    var selReg = document.getElementById('fRegion');
    specs.data.forEach(function(s) {
        specialtiesMap[s.id] = s.name;
        var opt = document.createElement('option');
        opt.value = s.id; opt.textContent = s.name;
        selSpec.appendChild(opt);
    });
    regs.data.forEach(function(r) {
        regionsMap[r.id] = r.name;
        var opt = document.createElement('option');
        opt.value = r.id; opt.textContent = r.name;
        selReg.appendChild(opt);
    });
}
loadSelectOptions().then(function() {
    AdminCRUD.init({
        table: 'doctors',
        entityName: 'Medico',
        modalId: 'modalDoctor',
        tbodyId: 'crudBody',
        searchColumn: 'name',
        renderRow: function(r) {
            return '<tr><td><strong>' + r.name + '</strong></td>' +
                '<td>' + (specialtiesMap[r.specialty_id] || '--') + '</td>' +
                '<td>' + (regionsMap[r.region_id] || '--') + '</td>' +
                '<td>' +
                    '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                    '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.name + '\')"><i class="bi bi-trash"></i></button>' +
                '</td></tr>';
        },
        getFormData: function() {
            var name = document.getElementById('fName').value.trim();
            if (!name) { alert('Nome obrigatorio'); return null; }
            return {
                name: name,
                specialty_id: document.getElementById('fSpecialty').value || null,
                region_id: document.getElementById('fRegion').value || null
            };
        },
        fillForm: function(d) {
            document.getElementById('fName').value = d.name || '';
            document.getElementById('fSpecialty').value = d.specialty_id || '';
            document.getElementById('fRegion').value = d.region_id || '';
        },
        clearForm: function() {
            document.getElementById('fName').value = '';
            document.getElementById('fSpecialty').value = '';
            document.getElementById('fRegion').value = '';
        }
    });
});
