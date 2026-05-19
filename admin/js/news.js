var regionsList = [];
async function loadRegions() {
    var { data } = await API.list('regions', { limit: 100 });
    regionsList = data || [];
    var sel = document.getElementById('fRegion');
    sel.innerHTML = '<option value="">Global (todos)</option>' +
        regionsList.map(function(r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('');
}
function formatDateBR(d) {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
loadRegions();
AdminCRUD.init({
    table: 'news',
    entityName: 'Noticia',
    modalId: 'modalNews',
    tbodyId: 'crudBody',
    searchColumn: 'title',
    renderRow: function(r) {
        var regionName = 'Global';
        if (r.region_id) {
            var reg = regionsList.find(function(x) { return x.id === r.region_id; });
            regionName = reg ? reg.name : 'Regional';
        }
        return '<tr>' +
            '<td><strong>' + r.title + '</strong></td>' +
            '<td>' + regionName + '</td>' +
            '<td>' + (r.is_published ? '<span style="color:green;">Sim</span>' : '<span style="color:red;">Nao</span>') + '</td>' +
            '<td>' + formatDateBR(r.published_at) + '</td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="viewNews(\'' + r.id + '\')"><i class="bi bi-eye"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.openEdit(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" onclick="AdminCRUD.remove(\'' + r.id + '\',\'' + r.title + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    },
    getFormData: function() {
        var title = document.getElementById('fTitle').value.trim();
        if (!title) { alert('Titulo obrigatorio'); return null; }
        var body = document.getElementById('fBody').value.trim();
        if (!body) { alert('Corpo obrigatorio'); return null; }
        return {
            title: title,
            body: body,
            region_id: document.getElementById('fRegion').value || null,
            image_url: document.getElementById('fImage').value.trim() || null,
            is_published: document.getElementById('fPublished').checked
        };
    },
    fillForm: function(d) {
        document.getElementById('fTitle').value = d.title || '';
        document.getElementById('fBody').value = d.body || '';
        document.getElementById('fRegion').value = d.region_id || '';
        document.getElementById('fImage').value = d.image_url || '';
        document.getElementById('fPublished').checked = d.is_published !== false;
    },
    clearForm: function() {
        document.getElementById('fTitle').value = '';
        document.getElementById('fBody').value = '';
        document.getElementById('fRegion').value = '';
        document.getElementById('fImage').value = '';
        document.getElementById('fPublished').checked = true;
    }
});
async function viewNews(id) {
    var d = await API.getById('news', id);
    if (!d) return;
    var regionName = 'Global';
    if (d.region_id) {
        var reg = regionsList.find(function(x) { return x.id === d.region_id; });
        regionName = reg ? reg.name : 'Regional';
    }
    document.getElementById('viewBody').innerHTML =
        (d.image_url ? '<img src="' + d.image_url + '" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:16px;" alt="">' : '') +
        '<h3 style="margin:0 0 8px;">' + d.title + '</h3>' +
        '<table style="width:100%; font-size:14px; margin-bottom:16px;">' +
            '<tr><td style="padding:4px 8px;"><strong>Regiao:</strong></td><td>' + regionName + '</td></tr>' +
            '<tr><td style="padding:4px 8px;"><strong>Publicada:</strong></td><td>' + (d.is_published ? 'Sim' : 'Nao') + '</td></tr>' +
            '<tr><td style="padding:4px 8px;"><strong>Data:</strong></td><td>' + formatDateBR(d.published_at) + '</td></tr>' +
        '</table>' +
        '<hr style="margin:16px 0;">' +
        '<div style="font-size:14px; line-height:1.7; white-space:pre-wrap;">' + d.body + '</div>';
    openModal('modalView');
}
