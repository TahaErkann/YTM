let cartModal;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await checkAuth();
        await loadProducts();
        await loadCart();
        
        cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
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
            throw new Error('Ürünler yüklenemedi');
        }

        const products = await response.json();
        const container = document.getElementById('productsContainer');
        
        // Önce container'ı temizle
        container.innerHTML = '';

        // Her ürün için bir kart oluştur
        products.forEach(product => {
            const card = `
                <div class="col">
                    <div class="card h-100">
                        <img src="${product.imageUrl || '/images/no-image.png'}" 
                             class="card-img-top" 
                             alt="${product.name}"
                             style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
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
                            <button class="btn btn-primary mt-auto" 
                                    onclick="addToCart('${product.id}')"
                                    ${product.stock > 0 ? '' : 'disabled'}>
                                <i class="bi bi-cart-plus"></i> Sepete Ekle
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Ürünler yüklenirken bir hata oluştu', 'error');
    }
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

async function loadCart() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cart = await response.json();
        updateCartDisplay(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function updateCartDisplay(cart) {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');

    if (!cart || cart.items.length === 0) {
        cartItems.innerHTML = '';
        emptyCart.style.display = 'block';
        cartTotal.textContent = '0.00 ₺';
        cartCount.textContent = '0';
        return;
    }

    emptyCart.style.display = 'none';
    cartCount.textContent = cart.items.length.toString();
    cartTotal.textContent = `${cart.totalAmount.toFixed(2)} ₺`;

    cartItems.innerHTML = cart.items.map(item => `
        <div class="d-flex align-items-center mb-3 border-bottom pb-3">
            <img src="${item.imageUrl || '/images/no-image.png'}" 
                 alt="${item.productName}"
                 style="width: 64px; height: 64px; object-fit: cover;"
                 class="me-3">
            <div class="flex-grow-1">
                <h6 class="mb-0">${item.productName}</h6>
                <small class="text-muted">${item.price} ₺</small>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary me-2" 
                        onclick="updateQuantity('${item.productId}', ${item.quantity - 1})"
                        ${item.quantity <= 1 ? 'disabled' : ''}>
                    <i class="bi bi-dash"></i>
                </button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary ms-2" 
                        onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">
                    <i class="bi bi-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ms-3" 
                        onclick="removeFromCart('${item.productId}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function addToCart(productId) {
    try {
        console.log('Adding product to cart:', productId);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ürün sepete eklenemedi');
        }

        await loadCart();
        showToast('Ürün sepete eklendi', 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast(error.message || 'Ürün sepete eklenirken bir hata oluştu', 'error');
    }
}

async function updateQuantity(productId, quantity) {
    if (quantity < 1) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/cart/items/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: quantity })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await loadCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Miktar güncellenirken bir hata oluştu', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/cart/items/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await loadCart();
        showToast('Ürün sepetten kaldırıldı');
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Ürün sepetten kaldırılırken bir hata oluştu', 'error');
    }
}

async function clearCart() {
    if (!confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cart', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await loadCart();
        showToast('Sepet temizlendi');
    } catch (error) {
        console.error('Error clearing cart:', error);
        showToast('Sepet temizlenirken bir hata oluştu', 'error');
    }
}

function showCart() {
    cartModal.show();
}

function showToast(message, type = 'success') {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '11';
    
    toastContainer.innerHTML = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" 
             role="alert" 
             aria-live="assertive" 
             aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" 
                        class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast" 
                        aria-label="Close"></button>
            </div>
        </div>
    `;
    
    document.body.appendChild(toastContainer);
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    toastContainer.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

function checkout() {
    // Sipariş verme fonksiyonu - daha sonra implement edilecek
    alert('Sipariş verme özelliği yakında eklenecek!');
} 