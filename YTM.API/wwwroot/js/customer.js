document.addEventListener('DOMContentLoaded', async function() {
    try {
        await checkAuth();
        await loadProducts();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

async function loadProducts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Ürünler yüklenirken bir hata oluştu: ' + error.message);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    products.forEach(product => {
        if (product.isActive) {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100 product-card">
                    <img src="${product.imageUrl || '/images/no-image.png'}" 
                         class="card-img-top product-image" 
                         alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description || ''}</p>
                        <p class="card-text">
                            <small class="text-muted">${product.brand || ''}</small>
                        </p>
                        <p class="card-text fw-bold">${product.price} ₺</p>
                        <p class="card-text">
                            <small class="text-${product.stock > 0 ? 'success' : 'danger'}">
                                ${product.stock > 0 ? 'Stokta' : 'Stokta Yok'}
                            </small>
                        </p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userRole) {
        window.location.replace('/login.html');
        return;
    }

    if (userRole !== 'Customer') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.replace('/login.html');
        return;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.replace('/login.html');
} 