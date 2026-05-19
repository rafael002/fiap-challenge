// Load regions for select
(async function() {
    var { data } = await supabase.from('regions').select('id, name').order('name');
    if (data) {
        var select = document.getElementById('region');
        data.forEach(function(r) {
            var opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            select.appendChild(opt);
        });
    }
})();
async function handleSignup(e) {
    e.preventDefault();
    var fullName = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var birthDate = document.getElementById('birthDate').value;
    var sex = document.getElementById('sex').value;
    var regionId = document.getElementById('region').value || null;
    var errorEl = document.getElementById('signupError');
    var errorMsg = errorEl.querySelector('span');
    var successEl = document.getElementById('signupSuccess');
    var btn = document.getElementById('btnSignup');
    errorEl.classList.remove('show');
    successEl.classList.remove('show');
    btn.disabled = true;
    btn.textContent = 'Criando conta...';
    // Sign up via Supabase Auth
    var { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            // Passed as user_metadata — trigger in Supabase creates profile row from this
            data: {
                full_name: fullName,
                birth_date: birthDate,
                biological_sex: sex,
                region_id: regionId
            }
        }
    });
    if (error) {
        errorMsg.textContent = error.message;
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Criar conta';
        return;
    }
    // Success
    successEl.classList.add('show');
    // Redirect after short delay
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
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
