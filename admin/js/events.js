var regionsList = [];
function toggleRegionField() {
    var scope = document.getElementById('fScope').value;
    document.getElementById('regionGroup').style.display = scope === 'REGIONAL' ? '' : 'none';
}
function toggleCustomTopN() {
    var val = document.getElementById('fTopN').value;
    document.getElementById('customTopNGroup').style.display = val === 'custom' ? '' : 'none';
}
async function loadRegions() {
    var { data } = await API.list('regions', { limit: 100 });
    regionsList = data || [];
    var sel = document.getElementById('fRegion');
    sel.innerHTML = '<option value="">Selecione...</option>' +
        regionsList.map(function(r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
}
function formatDateBR(d) {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
loadRegions();
AdminCRUD.init({
    table: 'events',
    entityName: 'Evento',
    modalId: 'modalEvent',
    tbodyId: 'crudBody',
    searchColumn: 'name',
    renderRow: function(r) {
        var regionName = '';
        if (r.region_id) {
            var reg = regionsList.find(function(x) { return x.id === r.region_id; });
            regionName = reg ? reg.name : '';
        }
        return '<tr>' +
            '<td><strong>' + r.name + '</strong></td>' +
            '<td>' + r.scope + (regionName ? ' (' + regionName + ')' : '') + '</td>' +
            '<td>' + r.top_n + '</td>' +
            '<td>' + formatDateBR(r.event_date) + '</td>' +
            '<td>' + (r.is_active ? '<span style="color:green;">Sim</span>' : '<span style="color:red;">Nao</span>') + '</td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="viewEvent(\'' + r.id + '\')"><i class="bi bi-eye"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.name + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    },
    getFormData: function() {
        var name = document.getElementById('fName').value.trim();
        if (!name) { alert('Nome obrigatorio'); return null; }
        var scope = document.getElementById('fScope').value;
        var topNSel = document.getElementById('fTopN').value;
        var topN = topNSel === 'custom' ? parseInt(document.getElementById('fTopNCustom').value) : parseInt(topNSel);
        if (!topN || topN < 1) { alert('Top N invalido'); return null; }
        var regionId = scope === 'REGIONAL' ? document.getElementById('fRegion').value : null;
        if (scope === 'REGIONAL' && !regionId) { alert('Selecione a regiao'); return null; }
        return {
            name: name,
            description: document.getElementById('fDesc').value.trim() || null,
            location: document.getElementById('fLocation').value.trim() || null,
            scope: scope,
            region_id: regionId || null,
            top_n: topN,
            event_date: document.getElementById('fDate').value || null,
            image_url: document.getElementById('fImage').value.trim() || null,
            is_active: document.getElementById('fActive').checked
        };
    },
    fillForm: function(d) {
        document.getElementById('fName').value = d.name || '';
        document.getElementById('fDesc').value = d.description || '';
        document.getElementById('fLocation').value = d.location || '';
        document.getElementById('fScope').value = d.scope || 'GLOBAL';
        toggleRegionField();
        document.getElementById('fRegion').value = d.region_id || '';
        var topN = d.top_n || 10;
        if ([10, 20, 50].includes(topN)) {
            document.getElementById('fTopN').value = topN.toString();
        } else {
            document.getElementById('fTopN').value = 'custom';
            document.getElementById('fTopNCustom').value = topN;
        }
        toggleCustomTopN();
        if (d.event_date) {
            document.getElementById('fDate').value = d.event_date.slice(0, 16);
        } else {
            document.getElementById('fDate').value = '';
        }
        document.getElementById('fImage').value = d.image_url || '';
        document.getElementById('fActive').checked = d.is_active !== false;
    },
    clearForm: function() {
        document.getElementById('fName').value = '';
        document.getElementById('fDesc').value = '';
        document.getElementById('fLocation').value = '';
        document.getElementById('fScope').value = 'GLOBAL';
        toggleRegionField();
        document.getElementById('fRegion').value = '';
        document.getElementById('fTopN').value = '10';
        toggleCustomTopN();
        document.getElementById('fDate').value = '';
        document.getElementById('fImage').value = '';
        document.getElementById('fActive').checked = true;
    }
});
async function viewEvent(id) {
    var d = await API.getById('events', id);
    if (!d) return;
    var regionName = 'Global';
    if (d.region_id) {
        var reg = regionsList.find(function(x) { return x.id === d.region_id; });
        regionName = reg ? reg.name : 'Regional';
    }
    document.getElementById('viewBody').innerHTML =
        (d.image_url ? '<img src="' + d.image_url + '" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:16px;" alt="">' : '') +
        '<h3 style="margin:0 0 8px;">' + d.name + '</h3>' +
        '<p style="color:#666; margin:0 0 16px;">' + (d.description || 'Sem descricao') + '</p>' +
        '<table style="width:100%; font-size:14px;">' +
            '<tr><td style="padding:4px 8px;"><strong>Escopo:</strong></td><td>' + d.scope + ' (' + regionName + ')</td></tr>' +
            '<tr><td style="padding:4px 8px;"><strong>Top N:</strong></td><td>' + d.top_n + '</td></tr>' +
            '<tr><td style="padding:4px 8px;"><strong>Data:</strong></td><td>' + formatDateBR(d.event_date) + '</td></tr>' +
            '<tr><td style="padding:4px 8px;"><strong>Local:</strong></td><td>' + (d.location || '--') + '</td></tr>' +
            '<tr><td style="padding:4px 8px;"><strong>Ativo:</strong></td><td>' + (d.is_active ? 'Sim' : 'Nao') + '</td></tr>' +
        '</table>';
    openModal('modalView');
}
