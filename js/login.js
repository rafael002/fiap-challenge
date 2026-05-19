async function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var errorEl = document.getElementById('loginError');
    var errorMsg = errorEl.querySelector('span');
    var btn = document.getElementById('btnLogin');
    errorEl.classList.remove('show');
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    var result = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (result.error) {
        errorMsg.textContent = result.error.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos.'
            : result.error.message;
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Entrar';
        return;
    }
    // Redirect to admin panel if user has is_admin flag
    var profile = await getCurrentProfile();
    if (profile && profile.is_admin) {
        window.location.href = 'admin/index.html';
    } else {
        window.location.href = 'index.html';
    }
}
function fillDemo(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    document.getElementById('loginError').classList.remove('show');
}
function togglePassword() {
    var input = document.getElementById('password');
    var icon = document.getElementById('passwordIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
    }
}
// Skip login page if already authenticated
(async function() {
    var user = await getCurrentUser();
    if (user) {
        var profile = await getCurrentProfile();
        if (profile && profile.is_admin) {
            window.location.href = 'admin/index.html';
        } else {
            window.location.href = 'index.html';
        }
    }
})();
