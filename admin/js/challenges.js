var ageGroupsMap = {};
var proceduresMap = {};
var editingChallengeId = null;
var sexLabel = { MASCULINO: 'Masculino', FEMININO: 'Feminino', GERAL: 'Geral' };
var procTypeLabel = { APPOINTMENT: 'Consultas', EXAM: 'Exames', VACCINE: 'Vacinas', OTHER: 'Outros' };
function buildProcOptions(selectedIds) {
    var grouped = {};
    Object.keys(proceduresMap).forEach(function(pid) {
        var p = proceduresMap[pid];
        if (!grouped[p.type]) grouped[p.type] = [];
        grouped[p.type].push({ id: pid, name: p.name });
    });
    var html = '';
    ['APPOINTMENT', 'EXAM', 'VACCINE', 'OTHER'].forEach(function(type) {
        if (!grouped[type] || grouped[type].length === 0) return;
        html += '<optgroup label="' + (procTypeLabel[type] || type) + '">';
        grouped[type].forEach(function(p) {
            var sel = selectedIds && selectedIds.indexOf(p.id) !== -1 ? ' selected' : '';
            html += '<option value="' + p.id + '"' + sel + '>' + p.name + '</option>';
        });
        html += '</optgroup>';
    });
    return html;
}
async function initChallenges() {
    var user = await requireAdmin();
    if (!user) return;
    // Load age groups for select
    var ags = await API.list('age_groups', { limit: 100, order: { column: 'min_age', ascending: true } });
    var selAg = document.getElementById('fAgeGroup');
    ags.data.forEach(function(ag) {
        ageGroupsMap[ag.id] = ag.name;
        var opt = document.createElement('option');
        opt.value = ag.id;
        opt.textContent = ag.name + ' (' + ag.min_age + '-' + ag.max_age + ')';
        selAg.appendChild(opt);
    });
    // Load procedures for sub-step selects (with type for grouping)
    var procs = await API.list('procedures', { limit: 200, order: { column: 'type', ascending: true } });
    procs.data.forEach(function(p) { proceduresMap[p.id] = { name: p.name, type: p.type }; });
    loadChallenges();
    bindSearch();
    bindSaveChallenge();
}
function bindSearch() {
    var searchInput = document.querySelector('.search-input input');
    if (!searchInput) return;
    var timeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(loadChallenges, 300);
    });
}
async function loadChallenges() {
    var tbody = document.getElementById('crudBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--cp-text-secondary);">Carregando...</td></tr>';
    var searchInput = document.querySelector('.search-input input');
    var search = searchInput ? searchInput.value.trim() : '';
    var options = { limit: 20, order: { column: 'created_at', ascending: false } };
    if (search) { options.search = search; options.searchColumn = 'name'; }
    var result = await API.list('challenges', options);
    var rows = result.data;
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--cp-text-secondary);">Nenhum desafio encontrado</td></tr>';
        return;
    }
    tbody.innerHTML = rows.map(function(r) {
        var isExpired = r.expires_at && new Date(r.expires_at) < new Date();
        var statusClass = isExpired ? 'badge-warning' : (r.is_active ? 'badge-active' : 'badge-inactive');
        var statusTxt = isExpired ? 'Expirado' : (r.is_active ? 'Ativo' : 'Inativo');
        var agName = r.age_group_id ? (ageGroupsMap[r.age_group_id] || '--') : 'Todas';
        var expTxt = r.expires_at ? new Date(r.expires_at).toLocaleDateString('pt-BR') : '--';
        return '<tr>' +
            '<td><strong>' + r.name + '</strong></td>' +
            '<td>' + (sexLabel[r.biological_sex] || r.biological_sex) + '</td>' +
            '<td>' + agName + '</td>' +
            '<td>' + (r.bonus_points || 0) + ' pts</td>' +
            '<td>' + expTxt + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + statusTxt + '</span></td>' +
            '<td>' +
                '<button class="btn btn-outline btn-sm btn-icon" title="Editar" onclick="openEditChallenge(\'' + r.id + '\')"><i class="bi bi-pencil"></i></button> ' +
                '<button class="btn btn-outline btn-sm btn-icon" title="Excluir" onclick="removeChallenge(\'' + r.id + '\',\'' + r.name.replace(/'/g, "\\'") + '\')"><i class="bi bi-trash"></i></button>' +
            '</td></tr>';
    }).join('');
}
// ---- Challenge CRUD ----
function openNewChallenge() {
    editingChallengeId = null;
    document.querySelector('#modalChallenge .modal-header h3').textContent = 'Novo Desafio';
    document.getElementById('fName').value = '';
    document.getElementById('fDesc').value = '';
    document.getElementById('fBonus').value = '';
    document.getElementById('fSex').value = 'GERAL';
    document.getElementById('fAgeGroup').value = '';
    document.getElementById('fIsActive').value = 'true';
    document.getElementById('fExpiresAt').value = '';
    document.getElementById('stepsInlineList').innerHTML = '';
    document.getElementById('stepsEmptyMsg').style.display = '';
    openModal('modalChallenge');
}
async function openEditChallenge(id) {
    editingChallengeId = id;
    document.querySelector('#modalChallenge .modal-header h3').textContent = 'Editar Desafio';
    var d = await API.getById('challenges', id);
    if (!d) return;
    document.getElementById('fName').value = d.name || '';
    document.getElementById('fDesc').value = d.description || '';
    document.getElementById('fBonus').value = d.bonus_points || '';
    document.getElementById('fSex').value = d.biological_sex || 'GERAL';
    document.getElementById('fAgeGroup').value = d.age_group_id || '';
    document.getElementById('fExpiresAt').value = d.expires_at ? d.expires_at.substring(0, 10) : '';
    document.getElementById('fIsActive').value = d.is_active ? 'true' : 'false';
    // Load steps inline
    document.getElementById('stepsInlineList').innerHTML = '';
    var steps = await API.list('steps', { filters: { challenge_id: id }, order: { column: 'step_order', ascending: true }, limit: 50 });
    for (var i = 0; i < steps.data.length; i++) {
        var s = steps.data[i];
        var subs = await API.list('sub_steps', { filters: { step_id: s.id }, order: { column: 'sub_step_order', ascending: true }, limit: 50 });
        var subStepsData = [];
        for (var j = 0; j < subs.data.length; j++) {
            var sub = subs.data[j];
            var procs = await API.list('sub_step_procedures', { filters: { sub_step_id: sub.id }, limit: 50 });
            subStepsData.push({ id: sub.id, name: sub.name, procs: procs.data.map(function(p) { return { id: p.procedure_id, required: p.required }; }) });
        }
        addStepBlock(s.id, s.name, s.description, s.points, s.step_order, subStepsData);
    }
    document.getElementById('stepsEmptyMsg').style.display = steps.data.length > 0 ? 'none' : '';
    openModal('modalChallenge');
}
// ---- Inline Steps ----
function addStepBlock(existingId, name, desc, points, order, subSteps) {
    var list = document.getElementById('stepsInlineList');
    document.getElementById('stepsEmptyMsg').style.display = 'none';
    var stepIdx = list.children.length + 1;
    var block = document.createElement('div');
    block.className = 'step-block';
    if (existingId) block.dataset.stepId = existingId;
    block.innerHTML =
        '<div class="step-block-header">' +
            '<strong><i class="bi bi-signpost-split"></i> Etapa ' + (order || stepIdx) + '</strong>' +
            '<button class="btn btn-outline btn-sm btn-icon" type="button" onclick="removeStepBlock(this)" title="Remover etapa"><i class="bi bi-trash"></i></button>' +
        '</div>' +
        '<div class="form-group"><label>Nome da etapa</label><input type="text" class="form-control step-name" placeholder="Ex: Consulta inicial" value="' + (name || '') + '"></div>' +
        '<div class="form-group"><label>Descricao</label><textarea class="form-control step-desc" placeholder="Descreva o que o usuario precisa fazer...">' + (desc || '') + '</textarea></div>' +
        '<div class="form-row">' +
            '<div class="form-group"><label>Pontos</label><input type="number" class="form-control step-points" placeholder="100" min="0" value="' + (points || '') + '"></div>' +
            '<div class="form-group"><label>Ordem</label><input type="number" class="form-control step-order" placeholder="1" min="1" value="' + (order || stepIdx) + '"></div>' +
        '</div>' +
        '<div class="step-substeps">' +
            '<div class="step-substeps-header">' +
                '<span><i class="bi bi-list-check"></i> Sub-etapas</span>' +
                '<button class="btn btn-outline btn-sm" type="button" onclick="addInlineSubStep(this)"><i class="bi bi-plus-lg"></i> Sub-etapa</button>' +
            '</div>' +
            '<div class="sub-steps-container"></div>' +
            '<div class="sub-steps-empty">Nenhuma sub-etapa.</div>' +
        '</div>';
    list.appendChild(block);
    if (subSteps && subSteps.length > 0) {
        block.querySelector('.sub-steps-empty').style.display = 'none';
        var container = block.querySelector('.sub-steps-container');
        subSteps.forEach(function(sub) {
            addInlineSubStepRow(container, sub.name, sub.id, sub.procs);
        });
    }
}
function removeStepBlock(btn) {
    btn.closest('.step-block').remove();
    if (document.getElementById('stepsInlineList').children.length === 0) {
        document.getElementById('stepsEmptyMsg').style.display = '';
    }
}
function addInlineSubStep(btn) {
    var substeps = btn.closest('.step-substeps');
    var empty = substeps.querySelector('.sub-steps-empty');
    if (empty) empty.style.display = 'none';
    var container = substeps.querySelector('.sub-steps-container');
    addInlineSubStepRow(container, '', null, []);
}
function getProcsForType(type) {
    var result = [];
    Object.keys(proceduresMap).forEach(function(pid) {
        if (proceduresMap[pid].type === type) result.push({ id: pid, name: proceduresMap[pid].name });
    });
    result.sort(function(a, b) { return a.name.localeCompare(b.name); });
    return result;
}
function onSubTypeChange(sel) {
    var row = sel.closest('.inline-sub-step');
    var procSel = row.querySelector('.sub-procs');
    var checksDiv = row.querySelector('.sub-required-checks');
    var type = sel.value;
    procSel.innerHTML = '<option value="">Selecione...</option>';
    checksDiv.innerHTML = '<span class="sub-required-empty">Selecione procedimentos acima</span>';
    if (!type) { procSel.disabled = true; return; }
    var procs = getProcsForType(type);
    procs.forEach(function(p) {
        procSel.innerHTML += '<option value="' + p.id + '">' + p.name + '</option>';
    });
    procSel.disabled = procs.length === 0;
}
function addInlineSubStepRow(container, name, existingId, selectedProcs) {
    // selectedProcs: array of { id, required } or empty array
    selectedProcs = selectedProcs || [];
    var selectedIds = selectedProcs.map(function(p) { return p.id || p; });
    var requiredIds = selectedProcs.filter(function(p) { return p.required; }).map(function(p) { return p.id; });
    var row = document.createElement('div');
    row.className = 'inline-sub-step';
    if (existingId) row.dataset.subId = existingId;
    // Detect selected type from existing procs
    var selType = '';
    if (selectedIds.length > 0 && proceduresMap[selectedIds[0]]) {
        selType = proceduresMap[selectedIds[0]].type;
    }
    var typeOptions = '<option value="">Selecione o tipo...</option>' +
        '<option value="APPOINTMENT"' + (selType === 'APPOINTMENT' ? ' selected' : '') + '>Consulta</option>' +
        '<option value="EXAM"' + (selType === 'EXAM' ? ' selected' : '') + '>Exame</option>' +
        '<option value="VACCINE"' + (selType === 'VACCINE' ? ' selected' : '') + '>Vacina</option>' +
        '<option value="OTHER"' + (selType === 'OTHER' ? ' selected' : '') + '>Outro</option>';
    var procOpts = '<option value="">Selecione o tipo primeiro...</option>';
    if (selType) {
        procOpts = '<option value="">Selecione...</option>';
        getProcsForType(selType).forEach(function(p) {
            var sel = selectedIds.indexOf(p.id) !== -1 ? ' selected' : '';
            procOpts += '<option value="' + p.id + '"' + sel + '>' + p.name + '</option>';
        });
    }
    // Build required checkboxes for selected procs
    var reqChecks = '';
    if (selectedIds.length > 0) {
        selectedIds.forEach(function(pid) {
            if (!proceduresMap[pid]) return;
            var checked = requiredIds.indexOf(pid) !== -1 ? ' checked' : '';
            reqChecks += '<label class="form-check"><input type="checkbox" class="proc-required" data-proc-id="' + pid + '"' + checked + '> ' + proceduresMap[pid].name + '</label>';
        });
    }
    row.innerHTML =
        '<div class="inline-sub-step-header">' +
            '<span><i class="bi bi-arrow-return-right"></i> Sub-etapa</span>' +
            '<button class="btn btn-outline btn-sm btn-icon" type="button" onclick="removeInlineSub(this)" title="Remover"><i class="bi bi-trash"></i></button>' +
        '</div>' +
        '<div class="form-group"><label>Nome</label>' +
            '<input type="text" class="form-control sub-name" placeholder="Ex: Fazer hemograma" value="' + (name || '') + '">' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group"><label>Tipo</label>' +
                '<select class="form-control sub-type" onchange="onSubTypeChange(this)">' + typeOptions + '</select>' +
            '</div>' +
            '<div class="form-group"><label>Procedimento</label>' +
                '<select class="form-control sub-procs" multiple>' + procOpts + '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group sub-required-section">' +
            '<label>Obrigatorios</label>' +
            '<div class="sub-required-checks">' + (reqChecks || '<span class="sub-required-empty">Selecione procedimentos acima</span>') + '</div>' +
        '</div>';
    // Update required checkboxes when procedure selection changes
    var procSelect = row.querySelector('.sub-procs');
    procSelect.addEventListener('change', function() {
        var checksDiv = row.querySelector('.sub-required-checks');
        var selected = Array.from(procSelect.selectedOptions).filter(function(o) { return o.value; });
        if (selected.length === 0) {
            checksDiv.innerHTML = '<span class="sub-required-empty">Selecione procedimentos acima</span>';
            return;
        }
        checksDiv.innerHTML = selected.map(function(o) {
            var prev = row.querySelector('.proc-required[data-proc-id="' + o.value + '"]');
            var checked = prev && prev.checked ? ' checked' : '';
            return '<label class="form-check"><input type="checkbox" class="proc-required" data-proc-id="' + o.value + '"' + checked + '> ' + o.textContent + '</label>';
        }).join('');
    });
    container.appendChild(row);
}
function removeInlineSub(btn) {
    var substeps = btn.closest('.step-substeps');
    btn.closest('.inline-sub-step').remove();
    if (substeps.querySelector('.sub-steps-container').children.length === 0) {
        var empty = substeps.querySelector('.sub-steps-empty');
        if (empty) empty.style.display = '';
    }
}
function bindSaveChallenge() {
    document.getElementById('btnSaveChallenge').onclick = async function() {
        var name = document.getElementById('fName').value.trim();
        if (!name) { alert('Nome obrigatorio'); return; }
        var stepBlocks = document.querySelectorAll('#stepsInlineList .step-block');
        if (stepBlocks.length === 0) { alert('Adicione pelo menos uma etapa ao desafio'); return; }
        var hasValidStep = false;
        stepBlocks.forEach(function(b) { if (b.querySelector('.step-name').value.trim()) hasValidStep = true; });
        if (!hasValidStep) { alert('Preencha o nome de pelo menos uma etapa'); return; }
        var record = {
            name: name,
            description: document.getElementById('fDesc').value.trim() || null,
            bonus_points: parseInt(document.getElementById('fBonus').value) || 0,
            biological_sex: document.getElementById('fSex').value,
            age_group_id: document.getElementById('fAgeGroup').value || null,
            is_active: document.getElementById('fIsActive').value === 'true',
            expires_at: document.getElementById('fExpiresAt').value || null
        };
        var result;
        var challengeId;
        if (editingChallengeId) {
            result = await API.update('challenges', editingChallengeId, record);
            challengeId = editingChallengeId;
        } else {
            result = await API.create('challenges', record);
            challengeId = result.data ? result.data.id : null;
        }
        if (result.error) { showToast('Erro: ' + result.error.message, 'error'); return; }
        // Save inline steps
        if (challengeId) {
            // Delete old steps not present in form
            if (editingChallengeId) {
                var oldSteps = await API.list('steps', { filters: { challenge_id: challengeId }, limit: 50 });
                var keepStepIds = [];
                document.querySelectorAll('#stepsInlineList .step-block').forEach(function(b) {
                    if (b.dataset.stepId) keepStepIds.push(b.dataset.stepId);
                });
                for (var i = 0; i < oldSteps.data.length; i++) {
                    if (keepStepIds.indexOf(oldSteps.data[i].id) === -1) {
                        await API.remove('steps', oldSteps.data[i].id);
                    }
                }
            }
            // Create/update steps
            var stepBlocks = document.querySelectorAll('#stepsInlineList .step-block');
            for (var i = 0; i < stepBlocks.length; i++) {
                var block = stepBlocks[i];
                var stepName = block.querySelector('.step-name').value.trim();
                if (!stepName) continue;
                var stepData = {
                    challenge_id: challengeId,
                    name: stepName,
                    description: block.querySelector('.step-desc').value.trim() || null,
                    points: parseInt(block.querySelector('.step-points').value) || 0,
                    step_order: parseInt(block.querySelector('.step-order').value) || (i + 1)
                };
                var stepId = block.dataset.stepId;
                var stepResult;
                if (stepId) {
                    stepResult = await API.update('steps', stepId, stepData);
                } else {
                    stepResult = await API.create('steps', stepData);
                    stepId = stepResult.data ? stepResult.data.id : null;
                }
                if (!stepId) continue;
                // Delete old sub_steps not in form
                if (block.dataset.stepId) {
                    var oldSubs = await API.list('sub_steps', { filters: { step_id: stepId }, limit: 50 });
                    var keepSubIds = [];
                    block.querySelectorAll('.inline-sub-step').forEach(function(r) {
                        if (r.dataset.subId) keepSubIds.push(r.dataset.subId);
                    });
                    for (var j = 0; j < oldSubs.data.length; j++) {
                        if (keepSubIds.indexOf(oldSubs.data[j].id) === -1) {
                            await API.remove('sub_steps', oldSubs.data[j].id);
                        }
                    }
                }
                // Create/update sub_steps and procedures
                var subRows = block.querySelectorAll('.inline-sub-step');
                for (var j = 0; j < subRows.length; j++) {
                    var subName = subRows[j].querySelector('.sub-name').value.trim();
                    if (!subName) continue;
                    var subId = subRows[j].dataset.subId;
                    var subResult;
                    if (subId) {
                        subResult = await API.update('sub_steps', subId, { name: subName, sub_step_order: j + 1 });
                    } else {
                        subResult = await API.create('sub_steps', { step_id: stepId, name: subName, sub_step_order: j + 1 });
                        subId = subResult.data ? subResult.data.id : null;
                    }
                    if (!subId) continue;
                    // Sync procedures
                    var procSelect = subRows[j].querySelector('.sub-procs');
                    var selectedProcs = Array.from(procSelect.selectedOptions).map(function(o) { return o.value; }).filter(function(v) { return v; });
                    var reqChecks = subRows[j].querySelectorAll('.proc-required');
                    var requiredMap = {};
                    reqChecks.forEach(function(cb) { requiredMap[cb.dataset.procId] = cb.checked; });
                    var oldProcs = await API.list('sub_step_procedures', { filters: { sub_step_id: subId }, limit: 50 });
                    var existingMap = {};
                    oldProcs.data.forEach(function(p) { existingMap[p.procedure_id] = p; });
                    // Remove unselected
                    for (var k = 0; k < oldProcs.data.length; k++) {
                        if (selectedProcs.indexOf(oldProcs.data[k].procedure_id) === -1) {
                            await API.remove('sub_step_procedures', oldProcs.data[k].id);
                        }
                    }
                    // Add new or update required
                    for (var k = 0; k < selectedProcs.length; k++) {
                        var pid = selectedProcs[k];
                        var isRequired = requiredMap[pid] || false;
                        if (existingMap[pid]) {
                            if (existingMap[pid].required !== isRequired) {
                                await API.update('sub_step_procedures', existingMap[pid].id, { required: isRequired });
                            }
                        } else {
                            await API.create('sub_step_procedures', { sub_step_id: subId, procedure_id: pid, required: isRequired });
                        }
                    }
                }
            }
        }
        closeModal('modalChallenge');
        showToast('Desafio salvo com sucesso!', 'success');
        loadChallenges();
    };
}
async function removeChallenge(id, name) {
    if (!confirmDelete(name)) return;
    var result = await API.remove('challenges', id);
    if (result.error) { showToast('Erro ao excluir: ' + result.error.message, 'error'); return; }
    showToast('"' + name + '" excluido!', 'success');
    loadChallenges();
}
initChallenges();
