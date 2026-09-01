function renderLogin() {
  return `
    <div class="login-page">
      <div class="login-card scale-in" style="max-width:440px;">
        <div class="login-logo">${icon('heart')}</div>
        <h1>Código Azul</h1>
        <p>Sistema Hospitalario de Reanimación</p>
        <div id="login-error" class="login-error">
          Credenciales incorrectas. Intente de nuevo.
        </div>
        <form id="login-form">
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" id="login-user" placeholder="Ingrese su usuario (ej: admin o consulta)" autocomplete="off" />
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" id="login-pass" placeholder="Ingrese su contraseña" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px; padding:12px; font-weight:700;">
            Iniciar Sesión
          </button>

          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--gray-200); text-align:center;">
            <span style="font-size:12px; color:var(--gray-500); font-weight:600; display:block; margin-bottom:10px;">ACCESO RÁPIDO SEGÚN ROL DE USUARIO:</span>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button type="button" class="btn btn-outline" style="width:100%; justify-content:center; font-size:12.5px; font-weight:700; border-color:var(--celeste-dark); color:var(--celeste-dark); background:#f0f9ff;" onclick="quickLogin('Administrador', 'Administrador')">
                 Iniciar como Administrador (Acceso Completo)
              </button>
              <button type="button" class="btn btn-outline" style="width:100%; justify-content:center; font-size:12.5px; font-weight:700; border-color:#0284c7; color:#0369a1; background:#e0f2fe;" onclick="quickLogin('Usuario Consulta', 'Consulta')">
                 Iniciar como Consulta (Solo Lectura)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

function quickLogin(username, role) {
  localStorage.setItem('codigoAzulUser', JSON.stringify({
    user: username,
    role: role,
    initials: username.substring(0, 2).toUpperCase()
  }));
  window.location.hash = '#/dashboard';
}

window.quickLogin = quickLogin;

function setupLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorEl = document.getElementById('login-error');

    const role = (user.toLowerCase().includes('consulta')) ? 'Consulta' : 'Administrador';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: user, 
          nombre_usuario: user, 
          password: pass, 
          contrasena_hash: pass 
        })
      });

      if (res.ok) {
        const data = await res.json();
        const serverUser = data.usuario || data.user || {};
        const uName = serverUser.nombre_usuario || serverUser.user || user;
        const uRole = serverUser.rol || serverUser.role || role;

        localStorage.setItem('codigoAzulUser', JSON.stringify({
          user: uName,
          role: String(uRole).toLowerCase().includes('consulta') ? 'Consulta' : 'Administrador',
          initials: uName.substring(0, 2).toUpperCase()
        }));
        if (data.token) {
          localStorage.setItem('codigoAzulToken', data.token);
        }
        window.location.hash = '#/dashboard';
        return;
      }
    } catch (err) {
      console.warn('API offline, checking local auth fallback');
    }

    // Offline / direct fallback
    if (!user) {
      errorEl.classList.add('show');
      return;
    }

    const finalUser = user === 'admin' ? 'Administrador' : (user === 'consulta' ? 'Usuario Consulta' : user);
    const finalRole = user.toLowerCase().includes('consulta') ? 'Consulta' : 'Administrador';

    localStorage.setItem('codigoAzulUser', JSON.stringify({
      user: finalUser,
      role: finalRole,
      initials: finalUser.substring(0, 2).toUpperCase()
    }));
    window.location.hash = '#/dashboard';
  });
}
