// inv-update.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector("#updateForm");
    
    if (form) {
        console.log('inv-update.js: Form found, adding change listener');
        
        // Enables the button when the user modifies the form
        form.addEventListener("input", function () {
            const updateBtn = document.querySelector("#updateForm button[type='submit']");
            if (updateBtn && updateBtn.disabled) {
                console.log('inv-update.js: Enabling submit button');
                updateBtn.disabled = false;
                updateBtn.textContent = 'Update Vehicle';
                updateBtn.classList.remove('disabled');
            }
        });
        
        // Also active on exchange (for select items)
        form.addEventListener("change", function () {
            const updateBtn = document.querySelector("#updateForm button[type='submit']");
            if (updateBtn && updateBtn.disabled) {
                console.log('inv-update.js: Enabling submit button on change');
                updateBtn.disabled = false;
                updateBtn.textContent = 'Update Vehicle';
                updateBtn.classList.remove('disabled');
            }
        });
    } else {
        console.log('inv-update.js: Form #updateForm not found');
    }
});