// inventory-management.js
document.addEventListener('DOMContentLoaded', function() {
    const classificationSelect = document.getElementById('classificationList');
    const inventoryTable = document.getElementById('inventoryDisplay');
    
    if (!classificationSelect || !inventoryTable) return;
    
    // Event listener for classification selection change
    classificationSelect.addEventListener('change', function() {
        const classificationId = this.value;
        
        if (!classificationId) {
            // Clear table if no classification selected
            inventoryTable.innerHTML = '';
            inventoryTable.classList.remove('visible');
            return;
        }
        
        // Fetch inventory data for selected classification
        fetchInventoryData(classificationId);
    });
    
    function fetchInventoryData(classificationId) {
        // Show loading state
        inventoryTable.innerHTML = '<tr><td colspan="3">Loading inventory data...</td></tr>';
        inventoryTable.classList.add('visible');
        
        // Make API request
        fetch(`/inv/getInventory/${classificationId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayInventoryData(data);
            })
            .catch(error => {
                console.error('Error fetching inventory data:', error);
                inventoryTable.innerHTML = `<tr><td colspan="3">Error loading inventory data: ${error.message}</td></tr>`;
            });
    }
    
    function displayInventoryData(inventoryItems) {
        if (!inventoryItems || inventoryItems.length === 0) {
            inventoryTable.innerHTML = '<tr><td colspan="3">No vehicles found in this classification.</td></tr>';
            return;
        }
        
        // Build table HTML
        let tableHTML = `
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Vehicle</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        inventoryItems.forEach(item => {
            tableHTML += `
                <tr>
                    <td>
                        <img src="${item.inv_thumbnail}" alt="${item.inv_make} ${item.inv_model}" class="vehicle-thumb">
                    </td>
                    <td>
                        <strong>${item.inv_year} ${item.inv_make} ${item.inv_model}</strong><br>
                        <span class="price">$${item.inv_price.toLocaleString()}</span>
                    </td>
                    <td>
                        <a href="/inv/detail/${item.inv_id}" class="btn-view">View</a>
                        <a href="/inv/edit/${item.inv_id}" class="btn-edit">Edit</a>
                        <a href="/inv/delete/${item.inv_id}" class="btn-delete">Delete</a>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody>';
        inventoryTable.innerHTML = tableHTML;
        inventoryTable.classList.add('visible');
    }
});