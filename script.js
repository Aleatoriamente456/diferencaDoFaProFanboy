const SUPABASE_URL = 'https://xksfhhijecyfdylfqqnp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0_9RJ0_BeWKDk8DNd-3XJw_5m9vcTgQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const isDashboard = window.location.pathname.includes('dashboard.html');

if (isDashboard) {
  async function verificarSessao() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('user-email').textContent = session.user.email;
    document.getElementById('user-id').textContent = session.user.id;
  }

  verificarSessao();

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });
}

if (!isDashboard) {
  let isLoginMode = true;

  const form = document.getElementById('auth-form');
  const formTitle = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const toggleMsg = document.getElementById('toggle-msg');
  const toggleLink = document.getElementById('toggle-link');
  const messageEl = document.getElementById('message');

  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      window.location.href = 'dashboard.html';
    }
  });

  toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    messageEl.textContent = '';

    if (isLoginMode) {
      formTitle.textContent = 'Entrar na Guilda';
      submitBtn.textContent = 'Invocar Acesso';
      toggleMsg.textContent = 'Ainda não faz parte da tropa do Mago?';
      toggleLink.textContent = 'Alistar-se agora';
    } else {
      formTitle.textContent = 'Alistamento no Fã-Clube';
      submitBtn.textContent = 'Concluir Alistamento';
      toggleMsg.textContent = 'Já tem passe da Guilda?';
      toggleLink.textContent = 'Entrar agora';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    messageEl.textContent = 'Consultando o grimório do Mago...';
    messageEl.className = 'message';

    if (isLoginMode) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        messageEl.textContent = 'Acesso negado: ' + error.message;
        messageEl.classList.add('error');
        submitBtn.disabled = false;
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        messageEl.textContent = 'Falha no alistamento: ' + error.message;
        messageEl.classList.add('error');
        submitBtn.disabled = false;
      } else {
        messageEl.textContent = 'Alistamento concluído! Entrando no Santuário...';
        messageEl.classList.add('success');

        if (data.session) {
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          submitBtn.disabled = false;
        }
      }
    }
  });
}