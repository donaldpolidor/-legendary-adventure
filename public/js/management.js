// management.js - Management View JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Management view loaded successfully');
    
    // Add any interactive functionality here if needed
    const managementCards = document.querySelectorAll('.management-card');
    
    managementCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent navigation if clicking anywhere on the card except the link
            if (e.target.tagName !== 'A') {
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
    });
});