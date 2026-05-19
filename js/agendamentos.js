function toggleSidebar() {
    document.querySelector('.cp-sidebar').classList.toggle('open');
    document.querySelector('.cp-sidebar-overlay').classList.toggle('open');
}
document.querySelectorAll('.cp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.cp-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});
var allAppointments = [];
function openApptDetail(idx) {
    var a = allAppointments[idx];
    if (!a) return;
    var isExam = a.type === 'EXAM';
    var statusText = '';
    var statusColor = '';
    if (a.status === 'SCHEDULED') { statusText = 'Confirmado'; statusColor = 'var(--cp-green)'; }
    else if (a.status === 'COMPLETED') { statusText = isExam ? 'Realizado' : 'Compareceu'; statusColor = 'var(--cp-green)'; }
    else if (a.status === 'CANCELLED') { statusText = 'Cancelado'; statusColor = 'var(--cp-orange)'; }
    else if (a.status === 'NO_SHOW') { statusText = 'No-show'; statusColor = 'var(--cp-red)'; }
    else { statusText = a.status; statusColor = '#666'; }
    document.querySelector('.cp-page-title').style.display = 'none';
    document.querySelector('.cp-tabs').style.display = 'none';
    document.querySelectorAll('.cp-tab-content').forEach(function(el) { el.style.display = 'none'; });
    document.getElementById('apptDetailView').style.display = '';
    document.getElementById('apptDetailContent').innerHTML =
        '<div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">' +
            '<div class="appt-icon ' + (isExam ? 'exam' : 'consultation') + '" style="width:56px;height:56px;font-size:24px;">' +
                '<i class="bi bi-' + (isExam ? 'clipboard2-pulse' : 'heart-pulse') + '"></i>' +
            '</div>' +
            '<div>' +
                '<h2 style="font-size:20px; font-weight:700; margin:0;">' + a.title + '</h2>' +
                '<span style="font-size:13px; color:' + statusColor + '; font-weight:600;">' + statusText + '</span>' +
            '</div>' +
        '</div>' +
        '<div style="background:#f8fafc; border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">' +
            (a.doctor_name ? '<div style="font-size:14px;"><i class="bi bi-person-badge me-2" style="color:var(--cp-blue);"></i><strong>Medico:</strong> ' + a.doctor_name + '</div>' : '') +
            (a.procedure_name ? '<div style="font-size:14px;"><i class="bi bi-clipboard2-pulse me-2" style="color:var(--cp-green);"></i><strong>Procedimento:</strong> ' + a.procedure_name + '</div>' : '') +
            '<div style="font-size:14px;"><i class="bi bi-calendar3 me-2" style="color:var(--cp-blue);"></i><strong>Data:</strong> ' + formatDateTime(a.scheduled_at) + '</div>' +
            (a.location ? '<div style="font-size:14px;"><i class="bi bi-geo-alt me-2" style="color:var(--cp-blue);"></i><strong>Local:</strong> ' + a.location + '</div>' : '') +
            '<div style="font-size:14px;"><i class="bi bi-tag me-2" style="color:var(--cp-blue);"></i><strong>Tipo:</strong> ' + (isExam ? 'Exame' : 'Consulta') + '</div>' +
        '</div>' +
        (a.notes ? '<div style="background:#FEF3C7; border-radius:12px; padding:12px 16px; font-size:14px; margin-bottom:20px;"><i class="bi bi-exclamation-triangle me-2" style="color:var(--cp-orange);"></i>' + a.notes + '</div>' : '') +
        (a.status === 'SCHEDULED' ? '<div style="display:flex; flex-direction:column; gap:10px;">' +
                '<button class="btn btn-cp-primary w-100" onclick="rescheduleAppt(' + idx + ')"><i class="bi bi-arrow-repeat me-1"></i>Reagendar</button>' +
                '<button class="btn btn-cp-danger w-100" onclick="closeApptDetail(); cancelAppt(\'' + a.type + '\',\'' + a.id + '\')"><i class="bi bi-x-circle me-1"></i>Cancelar agendamento</button>' +
            '</div>' : '');
    window.scrollTo(0, 0);
}
function closeApptDetail() {
    document.getElementById('apptDetailView').style.display = 'none';
    document.querySelector('.cp-page-title').style.display = '';
    document.querySelector('.cp-tabs').style.display = '';
    document.querySelectorAll('.cp-tab-content').forEach(function(el) { el.style.display = ''; });
    // Re-activate correct tab
    document.querySelectorAll('.cp-tab-content').forEach(function(c) { c.classList.remove('active'); });
    var activeTab = document.querySelector('.cp-tab.active');
    if (activeTab) document.getElementById('tab-' + activeTab.dataset.tab).classList.add('active');
}
function renderApptCard(a, isHistory, idx) {
    var isExam = a.type === 'EXAM';
    var statusBadge = '';
    var pointsLine = '';
    if (isHistory) {
        if (a.status === 'COMPLETED') {
            statusBadge = '<span class="cp-badge finished"><i class="bi bi-check-circle-fill"></i> ' + (isExam ? 'Realizado' : 'Compareceu') + '</span>';
            pointsLine = '<div class="mt-1" style="font-size:13px;color:var(--cp-green);font-weight:600;"><i class="bi bi-star-fill"></i> +100 pontos</div>';
        } else if (a.status === 'CANCELLED') {
            statusBadge = '<span class="cp-badge" style="background:#FEF3C7;color:var(--cp-orange);"><i class="bi bi-x-circle"></i> Cancelado</span>';
        } else if (a.status === 'NO_SHOW') {
            statusBadge = '<span class="cp-badge" style="background:#FEE2E2;color:var(--cp-red);"><i class="bi bi-x-circle-fill"></i> No-show</span>';
            pointsLine = '<div class="mt-1" style="font-size:13px;color:var(--cp-red);font-weight:600;"><i class="bi bi-dash-circle"></i> -100 pontos</div>';
        }
    } else {
        statusBadge = '<span class="cp-badge active"><i class="bi bi-check-circle"></i> Confirmado</span>';
    }
    var actions = '<div class="mt-3"><button class="btn btn-cp-outline w-100" onclick="openApptDetail(' + idx + ')"><i class="bi bi-eye me-1"></i>Ver detalhes</button></div>';
    return '<div class="cp-appointment-card' + (isHistory ? '" style="opacity:0.75;"' : ' animate-slide-up"') + '>' +
        '<div class="d-flex gap-3 align-items-start">' +
            '<div class="appt-icon ' + (isExam ? 'exam' : 'consultation') + '">' +
                '<i class="bi bi-' + (isExam ? 'clipboard2-pulse' : 'heart-pulse') + '"></i>' +
            '</div>' +
            '<div class="flex-grow-1">' +
                '<div class="d-flex justify-content-between align-items-start">' +
                    '<div><div class="appt-title">' + a.title + '</div>' +
                    '<div class="appt-doctor">' + (a.doctor_name || a.procedure_name || '') + '</div></div>' +
                    statusBadge +
                '</div>' +
                '<div class="appt-datetime mt-2">' +
                    '<div><i class="bi bi-calendar3"></i> ' + formatDateTime(a.scheduled_at) + '</div>' +
                    (a.location ? '<div><i class="bi bi-geo-alt"></i> ' + a.location + '</div>' : '') +
                '</div>' +
                pointsLine +
                actions +
            '</div>' +
        '</div>' +
    '</div>';
}
async function loadAppointments() {
    var data = await API.getUserAppointments();
    if (!data) return;
    // Merge all into one array for detail view indexing
    // Merge into single array so detail view indexes work across both tabs
    allAppointments = (data.upcoming || []).concat(data.past || []);
    var upEl = document.getElementById('upcomingList');
    var pastEl = document.getElementById('pastList');
    var upCount = (data.upcoming || []).length;
    if (upCount > 0) {
        upEl.innerHTML = data.upcoming.map(function(a, i) { return renderApptCard(a, false, i); }).join('');
    } else {
        upEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);"><i class="bi bi-calendar-x" style="font-size:24px;display:block;margin-bottom:8px;"></i>Nenhum agendamento proximo</div>';
    }
    if (data.past && data.past.length > 0) {
        pastEl.innerHTML = data.past.map(function(a, i) { return renderApptCard(a, true, upCount + i); }).join('');
    } else {
        pastEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--cp-text-secondary);">Nenhum historico</div>';
    }
}
var reschedAppt = null;
var reschedSlotId = null;
async function rescheduleAppt(idx) {
    var a = allAppointments[idx];
    if (!a) return;
    reschedAppt = a;
    reschedSlotId = null;
    var daysUntil = Math.floor((new Date(a.scheduled_at) - new Date()) / (1000*60*60*24));
    var isExam = a.type === 'EXAM';
    // Info do agendamento atual
    document.getElementById('reschedInfo').innerHTML =
        '<strong>' + a.title + '</strong>' +
        (a.doctor_name ? '<br><i class="bi bi-person-badge me-1"></i>' + a.doctor_name : '') +
        (a.procedure_name ? '<br><i class="bi bi-clipboard2-pulse me-1"></i>' + a.procedure_name : '') +
        '<br><i class="bi bi-calendar3 me-1"></i>Data atual: ' + formatDateTime(a.scheduled_at);
    // Penalidade
    document.getElementById('reschedPenaltyWarn').style.display = daysUntil < 3 ? '' : 'none';
    document.getElementById('reschedNoPenalty').style.display = daysUntil >= 3 ? '' : 'none';
    // Reset form
    document.getElementById('rDate').innerHTML = '<option value="">Carregando...</option>';
    document.getElementById('rDate').disabled = true;
    document.getElementById('rTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
    document.getElementById('rTime').disabled = true;
    document.getElementById('btnConfirmReagendar').disabled = true;
    if (isExam && a.procedure_id) {
        // Exame: mostrar seletor de unidade
        document.getElementById('rFacilityWrap').style.display = '';
        var facSelect = document.getElementById('rFacility');
        facSelect.innerHTML = '<option value="">Carregando...</option>';
        var facilities = await API.getExamFacilities(a.procedure_id);
        facSelect.innerHTML = '<option value="">Selecione...</option>';
        facilities.forEach(function(f) { facSelect.innerHTML += '<option value="' + f.id + '">' + f.name + '</option>'; });
        facSelect.disabled = facilities.length === 0;
    } else {
        // Consulta: esconder unidade, carregar datas direto
        document.getElementById('rFacilityWrap').style.display = 'none';
        if (a.doctor_id) {
            var dates = await API.getDoctorAvailableDates(a.doctor_id);
            var dateSelect = document.getElementById('rDate');
            dateSelect.innerHTML = '<option value="">Selecione...</option>';
            dates.forEach(function(d) {
                var dt = new Date(d + 'T12:00:00');
                var label = dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
                dateSelect.innerHTML += '<option value="' + d + '">' + label + '</option>';
            });
            dateSelect.disabled = dates.length === 0;
        }
    }
    closeApptDetail();
    new bootstrap.Modal(document.getElementById('modalReagendar')).show();
}
// Reagendar: Facility change (exames)
document.getElementById('rFacility').addEventListener('change', async function() {
    var facId = this.value;
    var dateSelect = document.getElementById('rDate');
    dateSelect.innerHTML = '<option value="">Carregando...</option>';
    dateSelect.disabled = true;
    document.getElementById('rTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
    document.getElementById('rTime').disabled = true;
    document.getElementById('btnConfirmReagendar').disabled = true;
    if (!facId || !reschedAppt) return;
    var dates = await API.getExamAvailableDates(reschedAppt.procedure_id, facId);
    dateSelect.innerHTML = '<option value="">Selecione...</option>';
    dates.forEach(function(d) {
        var dt = new Date(d + 'T12:00:00');
        var label = dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        dateSelect.innerHTML += '<option value="' + d + '">' + label + '</option>';
    });
    dateSelect.disabled = dates.length === 0;
});
// Reagendar: Date change
document.getElementById('rDate').addEventListener('change', async function() {
    var date = this.value;
    var timeSelect = document.getElementById('rTime');
    timeSelect.innerHTML = '<option value="">Carregando...</option>';
    timeSelect.disabled = true;
    document.getElementById('btnConfirmReagendar').disabled = true;
    reschedSlotId = null;
    if (!date || !reschedAppt) return;
    var times;
    if (reschedAppt.type === 'EXAM') {
        var facId = document.getElementById('rFacility').value;
        times = await API.getExamAvailableTimes(reschedAppt.procedure_id, facId, date);
    } else {
        times = await API.getDoctorAvailableTimes(reschedAppt.doctor_id, date);
    }
    timeSelect.innerHTML = '<option value="">Selecione...</option>';
    times.forEach(function(t) {
        var label = t.time.substring(0, 5);
        timeSelect.innerHTML += '<option value="' + t.id + '">' + label + '</option>';
    });
    timeSelect.disabled = times.length === 0;
});
// Reagendar: Time change
document.getElementById('rTime').addEventListener('change', function() {
    reschedSlotId = this.value;
    document.getElementById('btnConfirmReagendar').disabled = !this.value;
});
// Reagendar: Confirm
document.getElementById('btnConfirmReagendar').addEventListener('click', async function() {
    if (!reschedSlotId || !reschedAppt) return;
    this.disabled = true;
    var a = reschedAppt;
    var result = await API.rescheduleAppointment(a.type, a.id, reschedSlotId);
    if (result && result.success) {
        bootstrap.Modal.getInstance(document.getElementById('modalReagendar')).hide();
        var msg = result.penalty < 0 ? 'Reagendado. Penalidade: ' + result.penalty + ' pontos' : 'Reagendado com sucesso!';
        showToast(msg, result.penalty < 0 ? 'warning' : 'success');
        loadAppointments();
    } else {
        showToast(result ? result.error : 'Erro ao reagendar', 'error');
        this.disabled = false;
    }
});
async function cancelAppt(type, id) {
    var ok = await cpConfirm('Tem certeza que deseja cancelar este agendamento?', 'Cancelar agendamento', { type: 'warning', confirmText: 'Sim, cancelar', cancelText: 'Nao' });
    if (!ok) return;
    var result = await API.cancelAppointment(type, id);
    if (result && result.success) {
        var msg = result.penalty < 0 ? 'Cancelado. Penalidade: ' + result.penalty + ' pontos' : 'Cancelado com sucesso!';
        showToast(msg, result.penalty < 0 ? 'warning' : 'success');
        loadAppointments();
    }
}
// ---- DATA ----
var formData = { specialties: [], doctors: [], procedures: [] };
var selectedSlotId = null;
async function loadFormOptions() {
    var opts = await API.getFormOptions();
    if (!opts) return;
    formData.specialties = opts.specialties || [];
    formData.doctors = opts.doctors || [];
    formData.procedures = (opts.procedures || []).filter(function(p) { return p.type === 'EXAM' || p.type === 'VACCINE'; });
    // Populate specialty select
    var specSelect = document.getElementById('cSpecialty');
    formData.specialties.forEach(function(s) {
        specSelect.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>';
    });
    // Populate exam procedure select
    var procSelect = document.getElementById('eProcedure');
    formData.procedures.forEach(function(p) {
        procSelect.innerHTML += '<option value="' + p.id + '">' + p.name + '</option>';
    });
}
function openModal(type) {
    selectedSlotId = null;
    if (type === 'APPOINTMENT') {
        document.getElementById('formConsulta').reset();
        document.getElementById('cDoctor').disabled = true;
        document.getElementById('cDoctor').innerHTML = '<option value="">Selecione a especialidade primeiro</option>';
        document.getElementById('cDate').disabled = true;
        document.getElementById('cDate').innerHTML = '<option value="">Selecione o medico primeiro</option>';
        document.getElementById('cTime').disabled = true;
        document.getElementById('cTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
        document.getElementById('cLocationWrap').style.display = 'none';
        document.getElementById('btnConfirmConsulta').disabled = true;
        new bootstrap.Modal(document.getElementById('modalConsulta')).show();
    } else {
        document.getElementById('formExame').reset();
        document.getElementById('eFacility').disabled = true;
        document.getElementById('eFacility').innerHTML = '<option value="">Selecione o exame primeiro</option>';
        document.getElementById('eDate').disabled = true;
        document.getElementById('eDate').innerHTML = '<option value="">Selecione a unidade primeiro</option>';
        document.getElementById('eTime').disabled = true;
        document.getElementById('eTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
        document.getElementById('btnConfirmExame').disabled = true;
        new bootstrap.Modal(document.getElementById('modalExame')).show();
    }
}
// ---- CONSULTA: Specialty -> Doctor -> Date -> Time ----
document.getElementById('cSpecialty').addEventListener('change', function() {
    var specId = this.value;
    var docSelect = document.getElementById('cDoctor');
    docSelect.innerHTML = '<option value="">Selecione...</option>';
    var filtered = formData.doctors.filter(function(d) { return d.specialty_id === specId; });
    filtered.forEach(function(d) { docSelect.innerHTML += '<option value="' + d.id + '">' + d.name + '</option>'; });
    docSelect.disabled = filtered.length === 0;
    // Reset downstream
    document.getElementById('cDate').disabled = true;
    document.getElementById('cDate').innerHTML = '<option value="">Selecione o medico primeiro</option>';
    document.getElementById('cTime').disabled = true;
    document.getElementById('cTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
    document.getElementById('cLocationWrap').style.display = 'none';
    document.getElementById('btnConfirmConsulta').disabled = true;
});
document.getElementById('cDoctor').addEventListener('change', async function() {
    var doctorId = this.value;
    var dateSelect = document.getElementById('cDate');
    dateSelect.innerHTML = '<option value="">Carregando...</option>';
    dateSelect.disabled = true;
    document.getElementById('cTime').disabled = true;
    document.getElementById('cTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
    document.getElementById('cLocationWrap').style.display = 'none';
    document.getElementById('btnConfirmConsulta').disabled = true;
    if (!doctorId) return;
    var dates = await API.getDoctorAvailableDates(doctorId);
    dateSelect.innerHTML = '<option value="">Selecione...</option>';
    dates.forEach(function(d) {
        var dt = new Date(d + 'T12:00:00');
        var label = dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        dateSelect.innerHTML += '<option value="' + d + '">' + label + '</option>';
    });
    dateSelect.disabled = dates.length === 0;
});
document.getElementById('cDate').addEventListener('change', async function() {
    var doctorId = document.getElementById('cDoctor').value;
    var date = this.value;
    var timeSelect = document.getElementById('cTime');
    timeSelect.innerHTML = '<option value="">Carregando...</option>';
    timeSelect.disabled = true;
    document.getElementById('cLocationWrap').style.display = 'none';
    document.getElementById('btnConfirmConsulta').disabled = true;
    if (!date) return;
    var times = await API.getDoctorAvailableTimes(doctorId, date);
    timeSelect.innerHTML = '<option value="">Selecione...</option>';
    times.forEach(function(t) {
        var label = t.time.substring(0, 5);
        timeSelect.innerHTML += '<option value="' + t.id + '" data-facility="' + (t.facility_name || '') + '" data-address="' + (t.facility_address || '') + '">' + label + '</option>';
    });
    timeSelect.disabled = times.length === 0;
});
document.getElementById('cTime').addEventListener('change', function() {
    var opt = this.options[this.selectedIndex];
    selectedSlotId = this.value;
    var facility = opt.getAttribute('data-facility');
    var address = opt.getAttribute('data-address');
    if (facility) {
        document.getElementById('cLocation').innerHTML = '<i class="bi bi-geo-alt me-1"></i>' + facility + (address ? '<br><small style="color:var(--cp-text-secondary);">' + address + '</small>' : '');
        document.getElementById('cLocationWrap').style.display = 'block';
    }
    document.getElementById('btnConfirmConsulta').disabled = !this.value;
});
document.getElementById('btnConfirmConsulta').addEventListener('click', async function() {
    if (!selectedSlotId) return;
    this.disabled = true;
    var result = await API.createAppointment({
        type: 'APPOINTMENT',
        specialty_id: document.getElementById('cSpecialty').value || null,
        doctor_id: document.getElementById('cDoctor').value || null,
        slot_id: selectedSlotId
    });
    if (result && result.success) {
        bootstrap.Modal.getInstance(document.getElementById('modalConsulta')).hide();
        showToast('Consulta agendada com sucesso!', 'success');
        loadAppointments();
    } else {
        showToast(result ? result.error : 'Erro ao agendar', 'error');
        this.disabled = false;
    }
});
// ---- EXAME: Procedure -> Facility -> Date -> Time ----
document.getElementById('eProcedure').addEventListener('change', async function() {
    var procId = this.value;
    var facSelect = document.getElementById('eFacility');
    facSelect.innerHTML = '<option value="">Carregando...</option>';
    facSelect.disabled = true;
    document.getElementById('eDate').disabled = true;
    document.getElementById('eDate').innerHTML = '<option value="">Selecione a unidade primeiro</option>';
    document.getElementById('eTime').disabled = true;
    document.getElementById('eTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
    document.getElementById('btnConfirmExame').disabled = true;
    if (!procId) return;
    var facilities = await API.getExamFacilities(procId);
    facSelect.innerHTML = '<option value="">Selecione...</option>';
    facilities.forEach(function(f) { facSelect.innerHTML += '<option value="' + f.id + '">' + f.name + '</option>'; });
    facSelect.disabled = facilities.length === 0;
});
document.getElementById('eFacility').addEventListener('change', async function() {
    var procId = document.getElementById('eProcedure').value;
    var facId = this.value;
    var dateSelect = document.getElementById('eDate');
    dateSelect.innerHTML = '<option value="">Carregando...</option>';
    dateSelect.disabled = true;
    document.getElementById('eTime').disabled = true;
    document.getElementById('eTime').innerHTML = '<option value="">Selecione a data primeiro</option>';
    document.getElementById('btnConfirmExame').disabled = true;
    if (!facId) return;
    var dates = await API.getExamAvailableDates(procId, facId);
    dateSelect.innerHTML = '<option value="">Selecione...</option>';
    dates.forEach(function(d) {
        var dt = new Date(d + 'T12:00:00');
        var label = dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        dateSelect.innerHTML += '<option value="' + d + '">' + label + '</option>';
    });
    dateSelect.disabled = dates.length === 0;
});
document.getElementById('eDate').addEventListener('change', async function() {
    var procId = document.getElementById('eProcedure').value;
    var facId = document.getElementById('eFacility').value;
    var date = this.value;
    var timeSelect = document.getElementById('eTime');
    timeSelect.innerHTML = '<option value="">Carregando...</option>';
    timeSelect.disabled = true;
    document.getElementById('btnConfirmExame').disabled = true;
    if (!date) return;
    var times = await API.getExamAvailableTimes(procId, facId, date);
    timeSelect.innerHTML = '<option value="">Selecione...</option>';
    times.forEach(function(t) {
        var label = t.time.substring(0, 5);
        timeSelect.innerHTML += '<option value="' + t.id + '">' + label + '</option>';
    });
    timeSelect.disabled = times.length === 0;
});
document.getElementById('eTime').addEventListener('change', function() {
    selectedSlotId = this.value;
    document.getElementById('btnConfirmExame').disabled = !this.value;
});
document.getElementById('btnConfirmExame').addEventListener('click', async function() {
    if (!selectedSlotId) return;
    this.disabled = true;
    var procName = document.getElementById('eProcedure').options[document.getElementById('eProcedure').selectedIndex].text;
    var result = await API.createAppointment({
        type: 'EXAM',
        procedure_id: document.getElementById('eProcedure').value || null,
        name: procName,
        slot_id: selectedSlotId
    });
    if (result && result.success) {
        bootstrap.Modal.getInstance(document.getElementById('modalExame')).hide();
        showToast('Exame agendado com sucesso!', 'success');
        loadAppointments();
    } else {
        showToast(result ? result.error : 'Erro ao agendar', 'error');
        this.disabled = false;
    }
});
// Init
(async function() {
    var user = await requireUser();
    if (!user) return;
    await fillSidebarUser();
    await loadAppointments();
    await loadFormOptions();
    // Auto-open modal when coming from home page shortcuts (?open=APPOINTMENT|EXAM)
    var params = new URLSearchParams(window.location.search);
    var openType = params.get('open');
    if (openType === 'APPOINTMENT' || openType === 'EXAM') {
        openModal(openType);
    }
})();
