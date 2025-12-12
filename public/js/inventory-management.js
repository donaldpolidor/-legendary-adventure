// inventory-management.js
document.addEventListener('DOMContentLoaded', function() {
    const classificationSelect = document.getElementById('classificationList');
    const inventoryTable = document.getElementById('inventoryDisplay');
    
    if (!classificationSelect || !inventoryTable) {
        console.log('Classification select or inventory table not found');
        return;
    }
    
    console.log('Inventory management script loaded');
    
    // Event listener for classification selection change
    classificationSelect.addEventListener('change', function() {
        const classificationId = this.value;
        console.log('Classification changed to:', classificationId);
        
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
        console.log('Fetching inventory for classification:', classificationId);
        
        // Show loading state
        inventoryTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading inventory data...</p>
                </td>
            </tr>
        `;
        inventoryTable.classList.add('visible');
        
        // Make API request
        fetch(`/inv/getInventory/${classificationId}`)
            .then(response => {
                console.log('API Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data.length, 'items');
                displayInventoryData(data);
            })
            .catch(error => {
                console.error('Error fetching inventory data:', error);
                inventoryTable.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-danger text-center">
                            <p>Error loading inventory data.</p>
                            <small>${error.message}</small>
                        </td>
                    </tr>
                `;
            });
    }
    
    function displayInventoryData(inventoryItems) {
        console.log('Displaying inventory:', inventoryItems);
        
        if (!inventoryItems || inventoryItems.length === 0) {
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        No vehicles found in this classification.
                    </td>
                </tr>
            `;
            inventoryTable.classList.add('visible');
            return;
        }
        
        // Build table HTML
        let tableHTML = `
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Vehicle Details</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        inventoryItems.forEach(item => {
            tableHTML += `
                <tr>
                    <td style="width: 120px;">
                        <img src="${item.inv_thumbnail || '/images/vehicles/no-image-tn.jpg'}" 
                             alt="${item.inv_make} ${item.inv_model}" 
                             class="vehicle-thumb"
                             style="width: 100px; height: 70px; object-fit: cover; border-radius: 4px;">
                    </td>
                    <td>
                        <strong>${item.inv_year} ${item.inv_make} ${item.inv_model}</strong><br>
                        <span class="text-muted">${item.classification_name}</span><br>
                        <span class="price" style="color: #28a745; font-weight: bold;">
                            $${item.inv_price ? item.inv_price.toLocaleString() : 'N/A'}
                        </span>
                    </td>
                    <td style="min-width: 200px;">
                        <div class="btn-group" role="group">
                            <a href="/inv/detail/${item.inv_id}" 
                               class="btn btn-sm btn-outline-primary"
                               title="View Details">
                                View
                            </a>
                            <a href="/inv/edit/${item.inv_id}" 
                               class="btn btn-sm btn-outline-warning"
                               title="Edit Vehicle">
                                Edit
                            </a>
                            <a href="/inv/delete/${item.inv_id}" 
                               class="btn btn-sm btn-outline-danger"
                               title="Delete Vehicle"
                               onclick="return confirm('Are you sure you want to delete this vehicle?')">
                                Delete
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody>';
        inventoryTable.innerHTML = tableHTML;
        inventoryTable.classList.add('visible');
    }
    
    // Trigger change event if there's already a selected value
    if (classificationSelect.value) {
        console.log('Initial classification:', classificationSelect.value);
        fetchInventoryData(classificationSelect.value);
    }
});