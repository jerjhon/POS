function renderProductList() {
    const tbody = document.querySelector('#productListTable tbody');
    tbody.innerHTML = '';
    products.forEach((product, index) => {
        const tr = document.createElement('tr');
        const imgSrc = product.image ? product.image : 'https://via.placeholder.com/50';

        // Prepare sizes display string from sizes array
        let sizesDisplay = '';
        if (product.sizes && product.sizes.length > 0) {
            sizesDisplay = product.sizes.map(s => s.size).join(', ');
        } else {
            sizesDisplay = '';
        }

        // Calculate total stock from sizes array
        let totalStock = 0;
        if (product.sizes && product.sizes.length > 0) {
            totalStock = product.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
        } else if (product.stock !== undefined) {
            totalStock = product.stock;
        }

        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>${totalStock}</td>
            <td>${sizesDisplay}</td>
            <td>${product.category}</td>
            <td><img src="${imgSrc}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
            <td>
                <button class="edit-btn" data-index="${index}" style="padding: 5px 10px; background-color: #0984e3; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">Edit</button>
                <button class="delete-btn" data-index="${index}" style="padding: 5px 10px; background-color: #d63031; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            openEditProductPopup(idx);
        });
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            if (confirm('Are you sure you want to delete this product?')) {
                products.splice(idx, 1);
                saveProducts();
                displayProducts();
                renderProductList();
            }
        });
    });
}
