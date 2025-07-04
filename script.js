document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = 'https://imagebackend-d2k5.onrender.com';

  const loginIcon = document.getElementById('loginIcon');
  const logoutBtn = document.getElementById('logoutBtn');
  const authBox = document.getElementById('authBox');
  const authForm = document.getElementById('authForm');
  const formTitle = document.getElementById('formTitle');
  const toggleForm = document.getElementById('toggleForm');
  const uploadForm = document.getElementById('uploadForm');
  const loggedInUser = document.getElementById('loggedInUser');
  const loginPanel = document.getElementById('loginPanel');
  const coffeeBtn = document.getElementById('coffeeBtn');
  const coffeePanel = document.getElementById('coffeePanel');
  const closeCoffeePanel = document.getElementById('closeCoffeePanel');

  let isLogin = true;

  function setLoginState(loggedIn, userId = '') {
    if (loggedIn) {
      loginIcon.style.display = 'block';
      loginPanel.classList.add('active');
      loggedInUser.textContent = `User: ${userId}`;
    } else {
      loginPanel.classList.remove('active');
      loginIcon.style.display = 'block';
    }
  }

  if (localStorage.getItem('token')) {
    const userId = localStorage.getItem('userId') || 'User';
    setLoginState(true, userId);
  }

  toggleForm.addEventListener('click', () => {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    authForm.querySelector('button').textContent = isLogin ? 'Login' : 'Sign Up';
    toggleForm.innerHTML = isLogin
      ? `Don't have an account? <span>Create one</span>`
      : `Already have an account? <span>Login</span>`;
  });

  loginIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    authBox.classList.add('active', 'slide-in');
    setTimeout(() => authBox.classList.remove('slide-in'), 500);
  });

  document.addEventListener('click', (e) => {
    if (!authBox.contains(e.target) && e.target !== loginIcon && authBox.classList.contains('active')) {
      authBox.classList.add('slide-out');
      setTimeout(() => {
        authBox.classList.remove('slide-out', 'active');
      }, 500);
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    alert('You have been logged out.');
    setLoginState(false);
    window.location.reload();
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const endpoint = isLogin ? '/api/login' : '/api/signup';

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.email);
        alert(`Welcome ${isLogin ? 'back' : ''}, ${data.email}!`);
        authBox.classList.remove('active');
        setLoginState(true, data.email);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Try again later.');
    }
  });

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('mediaInput').files[0];
    const loading = document.getElementById('loading');
    const codeBox = document.getElementById('codeBox');
    const copyBtn = document.getElementById('copyCodeBtn');

    if (!file) return alert('Please select a file.');
    if (!(file.type.startsWith('image/') || file.type.startsWith('video/')))
      return alert('Only image or video files are allowed!');
    if (file.size > 100 * 1024 * 1024) return alert('Max size allowed is 100MB.');

    const formData = new FormData();
    formData.append('media', file); 


    loading.style.display = 'block';

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      codeBox.textContent = `Your Secret Code: ${data.code}`;
      codeBox.style.display = 'block';
      copyBtn.style.display = 'inline-block';
      uploadForm.reset();
    } catch (err) {
      alert('Upload failed. Try again.');
      console.error(err);
    } finally {
      loading.style.display = 'none';
    }
  });

  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('codeBox').textContent.replace('Your Secret Code: ', '');
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied to clipboard!');
    });
  });

  window.downloadMedia = () => {
    const code = document.getElementById('codeInput').value.trim();
    if (!code) return alert('Enter a code.');
    window.location.href = `${BACKEND_URL}/download/${code}`;
  };

  coffeeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    coffeePanel.classList.toggle('active');
  });

  closeCoffeePanel.addEventListener('click', () => {
    coffeePanel.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (!coffeePanel.contains(e.target) && e.target !== coffeeBtn) {
      coffeePanel.classList.remove('active');
    }
  });
});
