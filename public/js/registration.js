// registration.js - Registration Form JavaScript
function togglePassword() {
    const passwordInput = document.getElementById('account_password');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = 'Show';
    }
}

// Real-time password validation feedback
function setupPasswordValidation() {
    const passwordInput = document.getElementById('account_password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
            const password = e.target.value;
            const requirements = {
                length: password.length >= 12,
                number: /\d/.test(password),
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                special: /[^a-zA-Z0-9]/.test(password)
            };
            
            // Visual feedback for password requirements
            updatePasswordRequirements(requirements);
        });
    }
}

// Update visual feedback for password requirements
function updatePasswordRequirements(requirements) {
    // You can implement visual indicators for each requirement here
    console.log('Password validation:', requirements);
    
    // Example: Change border color based on overall validity
    const passwordInput = document.getElementById('account_password');
    const allValid = Object.values(requirements).every(req => req === true);
    
    if (passwordInput.value.length > 0) {
        if (allValid) {
            passwordInput.style.borderColor = '#28a745';
        } else {
            passwordInput.style.borderColor = '#dc3545';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupPasswordValidation();
    console.log('Registration form loaded successfully');
});