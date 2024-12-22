document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Login attempt:', { email, password }); // Debug için

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Server response:', response); // Debug için

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Giriş başarısız');
        }

        const data = await response.json();
        console.log('Login successful:', data); // Debug için

        localStorage.setItem('token', data.token);

        // Token'dan rol bilgisini al
        const tokenParts = data.token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload); // Debug için

        // Role claim'ini kontrol et
        const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        console.log('User role:', userRole); // Debug için

        // Role göre yönlendirme
        if (userRole === 'Admin') {
            console.log('Redirecting to admin panel...'); // Debug için
            window.location.href = '/admin/dashboard.html';
        } else {
            console.log('Redirecting to customer panel...'); // Debug için
            window.location.href = '/customer/dashboard.html';
        }
    } catch (error) {
        console.error('Login error:', error); // Debug için
        alert('Giriş başarısız: ' + error.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role: 'Customer' // Varsayılan rol
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Kayıt başarısız');
        }

        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
        window.location.href = '/login.html';
    } catch (error) {
        alert('Kayıt başarısız: ' + error.message);
    }
} 