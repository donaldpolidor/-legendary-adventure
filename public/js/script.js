// Animation pour le formulaire de connexion
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const pswdBtn = document.getElementById('pswdBtn');
    const passwordInput = document.getElementById('password');
    
    // Fonction pour afficher/masquer le mot de passe
    if (pswdBtn && passwordInput) {
        pswdBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                pswdBtn.textContent = 'Masquer le mot de passe';
            } else {
                passwordInput.type = 'password';
                pswdBtn.textContent = 'Afficher le mot de passe';
            }
        });
    }
    
    // Validation en temps réel du formulaire
    if (loginForm) {
        const emailInput = document.getElementById('email');
        
        emailInput.addEventListener('input', function() {
            if (emailInput.validity.valid) {
                emailInput.style.borderColor = '#27ae60';
            } else {
                emailInput.style.borderColor = '#e74c3c';
            }
        });
        
        passwordInput.addEventListener('input', function() {
            if (passwordInput.validity.valid) {
                passwordInput.style.borderColor = '#27ae60';
            } else {
                passwordInput.style.borderColor = '#e74c3c';
            }
        });
    }
});