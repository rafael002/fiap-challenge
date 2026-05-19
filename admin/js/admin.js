/* ============================================================
   CARE PLUS ADMIN - JavaScript
   ============================================================ */

// Sidebar toggle (mobile)
function toggleSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('open');
    document.querySelector('.sidebar-overlay').classList.toggle('open');
}

// Modal open/close
function openModal(modalId) {
    document.getElementById(modalId).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// Tab switching
function switchTab(tabGroup, tabName) {
    document.querySelectorAll('[data-tab-group="' + tabGroup + '"]').forEach(function(el) {
        el.classList.remove('active');
    });
    document.querySelectorAll('[data-tab="' + tabName + '"]').forEach(function(el) {
        el.classList.add('active');
    });
}

// Toast notification
function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    toast.className = 'admin-toast ' + type;
    toast.innerHTML = '<i class="bi bi-' + (type === 'success' ? 'check-circle-fill' : type === 'error' ? 'x-circle-fill' : 'info-circle-fill') + '"></i> ' + message;
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:' +
        (type === 'success' ? '#2EAD6D' : type === 'error' ? '#EF4444' : '#0079C8') +
        ';color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;z-index:9999;' +
        'display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);' +
        'animation:slideInRight 0.3s ease;font-family:Open Sans,sans-serif;';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// Confirm delete
function confirmDelete(itemName) {
    return confirm('Tem certeza que deseja excluir "' + itemName + '"?');
}

// Simulated save action (for mockup)
function simulateSave(modalId, successMessage) {
    if (modalId) closeModal(modalId);
    showToast(successMessage || 'Salvo com sucesso!', 'success');
}

// Simulated delete action (for mockup)
function simulateDelete(itemName) {
    if (confirmDelete(itemName)) {
        showToast('"' + itemName + '" excluido com sucesso!', 'success');
        return true;
    }
    return false;
}

// Add CSS animation keyframe
var style = document.createElement('style');
style.textContent = '@keyframes slideInRight{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(style);
