/* CARE PLUS - App JS: animations, toasts, confetti, confirm modals */

function cpAlert(message, title) {
    return cpConfirm(message, title || 'Aviso', { showCancel: false });
}

function cpConfirm(message, title, opts) {
    opts = opts || {};
    var showCancel = opts.showCancel !== false;
    var confirmText = opts.confirmText || 'OK';
    var cancelText = opts.cancelText || 'Cancelar';
    var type = opts.type || 'info';

    return new Promise(function(resolve) {
        var existing = document.getElementById('cp-confirm-modal');
        if (existing) existing.remove();

        var iconMap = { info: 'bi-info-circle-fill', success: 'bi-check-circle-fill', warning: 'bi-exclamation-triangle-fill', danger: 'bi-x-circle-fill' };
        var colorMap = { info: 'var(--cp-blue)', success: 'var(--cp-green)', warning: 'var(--cp-gold)', danger: 'var(--cp-red)' };

        var overlay = document.createElement('div');
        overlay.id = 'cp-confirm-modal';
        overlay.className = 'cp-confirm-overlay';
        overlay.innerHTML =
            '<div class="cp-confirm-box">' +
                '<div class="cp-confirm-icon" style="color:' + colorMap[type] + '"><i class="bi ' + iconMap[type] + '"></i></div>' +
                '<div class="cp-confirm-title">' + (title || 'Confirmacao') + '</div>' +
                '<div class="cp-confirm-message">' + message + '</div>' +
                '<div class="cp-confirm-actions">' +
                    (showCancel ? '<button class="btn btn-cp-outline cp-confirm-cancel">' + cancelText + '</button>' : '') +
                    '<button class="btn btn-cp-primary cp-confirm-ok">' + confirmText + '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        overlay.querySelector('.cp-confirm-ok').addEventListener('click', function() { overlay.remove(); resolve(true); });
        if (showCancel) {
            overlay.querySelector('.cp-confirm-cancel').addEventListener('click', function() { overlay.remove(); resolve(false); });
            overlay.addEventListener('click', function(e) { if (e.target === overlay) { overlay.remove(); resolve(false); } });
        }
    });
}

function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('cp-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cp-toast-container';
        document.body.appendChild(container);
    }

    var icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill',
        warning: 'bi-exclamation-triangle-fill'
    };

    var toast = document.createElement('div');
    toast.className = 'cp-toast cp-toast-' + type;
    toast.innerHTML = '<i class="bi ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
    container.appendChild(toast);

    if (window.gsap) {
        gsap.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
    } else {
        toast.style.opacity = '1';
    }

    setTimeout(function() {
        if (window.gsap) {
            gsap.to(toast, { y: -20, opacity: 0, duration: 0.3, onComplete: function() { toast.remove(); } });
        } else {
            toast.remove();
        }
    }, 3500);
}

function launchConfetti() {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    var colors = ['#0079C8', '#2EAD6D', '#F59E0B', '#EF4444', '#3B82F6', '#F97316'];

    for (var i = 0; i < 60; i++) {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (Math.random() * 8 + 6) + 'px';
        piece.style.height = (Math.random() * 8 + 6) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(piece);

        if (window.gsap) {
            gsap.fromTo(piece, {
                y: -20, x: 0, rotation: 0, opacity: 1
            }, {
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 200,
                rotation: Math.random() * 720,
                opacity: 0,
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'power1.in'
            });
        } else {
            piece.style.animationDelay = Math.random() * 2 + 's';
        }
    }

    setTimeout(function() { container.remove(); }, 5000);
}

function animateCounter(element, target, duration) {
    if (window.gsap) {
        var obj = { val: 0 };
        gsap.to(obj, {
            val: target,
            duration: duration / 1000,
            ease: 'power2.out',
            onUpdate: function() {
                element.textContent = Math.floor(obj.val).toLocaleString('pt-BR');
            }
        });
    } else {
        var start = 0;
        var startTime = performance.now();
        function update(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.floor(start + (target - start) * eased).toLocaleString('pt-BR');
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

function animatePageContent() {
    if (!window.gsap) return;

    gsap.utils.toArray('.cp-appointment-card, .cp-challenge-card, .cp-shortcut, .cp-notification-item').forEach(function(el, i) {
        gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: i * 0.08, ease: 'power2.out' });
    });

    var pointsCard = document.querySelector('.cp-points-card');
    if (pointsCard) {
        gsap.fromTo(pointsCard, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
    }

    gsap.utils.toArray('.progress-bar').forEach(function(bar) {
        var targetWidth = bar.getAttribute('aria-valuenow') + '%';
        gsap.fromTo(bar, { width: '0%' }, { width: targetWidth, duration: 0.8, delay: 0.3, ease: 'power2.out' });
    });

    gsap.utils.toArray('.cp-section-title').forEach(function(el, i) {
        gsap.fromTo(el, { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, delay: 0.2 + i * 0.1 });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!window.gsap) {
        document.querySelectorAll('.progress-bar').forEach(function(bar) {
            var targetWidth = bar.getAttribute('aria-valuenow') + '%';
            bar.style.width = '0%';
            setTimeout(function() { bar.style.width = targetWidth; }, 300);
        });

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.cp-appointment-card, .cp-challenge-card, .cp-ranking-preview').forEach(function(el) {
            observer.observe(el);
        });
    }

    setTimeout(animatePageContent, 100);
});
