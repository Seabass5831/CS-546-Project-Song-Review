document.addEventListener('DOMContentLoaded', function() {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                document.getElementById('loginError').textContent = 'Please fill in all required fields.';
                return;
            }

            fetch('/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/users/profile'; // Redirect to profile page after success
                } else {
                    document.getElementById('loginError').textContent = data.error; // Show error message
                }
            })
            .catch(error => console.error('Error:', error));
        });
    } else {
        console.log('Login form not found on this page.');
    }

    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission started');
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const favoriteGenres = document.getElementById('favoriteGenres').value;

            if (!firstName || !lastName || !email || !password || !favoriteGenres) {
                document.getElementById('registerError').textContent = 'Please fill in all required fields.';
                return;
            }

            fetch('/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    favoriteGenres
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('registerSuccess').textContent = "Registration successful! Redirecting to login...";
                    window.setTimeout(() => {
                        window.location.href = '/users/login'; // Redirect to login page after success
                    }, 2000);
                } else {
                    document.getElementById('registerError').textContent = data.error; // Show error message
                }
            })
            .catch(error => console.error('Error:', error));
        });
    } else {
        console.log('Register form not found on this page.');
    }
});
