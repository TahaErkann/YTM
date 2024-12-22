document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Token'dan rol bilgisini al
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    // Admin yetkisi kontrolü
    if (userRole !== 'Admin') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.href = '/index.html';
        return;
    }

    // Admin arayüzünü göster
    document.querySelector('.admin-container').style.display = 'flex';
    
    loadProducts();
    setupEventListeners();
});

// Ürün modalını göster
function showProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');

    // Form alanlarını temizle
    form.reset();

    if (product) {
        modalTitle.textContent = 'Ürün Düzenle';
        form.elements.productId.value = product.id;
        form.elements.productName.value = product.name;
        form.elements.productDescription.value = product.description;
        form.elements.productPrice.value = product.price;
        form.elements.productBrand.value = product.brand;
        form.elements.productStock.value = product.stock;
        form.elements.productImage.value = product.imageUrl;
    } else {
        modalTitle.textContent = 'Yeni Ürün Ekle';
        form.elements.productId.value = '';
    }

    modal.style.display = 'block';
}

// Ürün kaydetme
async function handleProductSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const productId = form.elements.productId.value;

    try {
        const productData = {
            name: form.elements.productName.value,
            description: form.elements.productDescription.value,
            price: parseFloat(form.elements.productPrice.value),
            brand: form.elements.productBrand.value,
            stock: parseInt(form.elements.productStock.value),
            imageUrl: form.elements.productImage.value
        };

        if (!productData.name || !productData.price || !productData.stock) {
            alert('Lütfen zorunlu alanları doldurun!');
            return;
        }

        console.log('Gönderilecek veri:', productData);

        const url = productId ? `/api/products/${productId}` : '/api/products';
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(productData)
        });

        console.log('Sunucu yanıtı:', response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ürün kaydedilemedi');
        }

        // Modal'ı kapat
        document.getElementById('productModal').style.display = 'none';
        
        // Ürün listesini güncelle
        await loadProducts();
        
        // Başarı mesajı göster
        alert(productId ? 'Ürün başarıyla güncellendi!' : 'Yeni ürün başarıyla eklendi!');
        
        // Formu temizle
        form.reset();
    } catch (error) {
        console.error('Ürün kaydetme hatası:', error);
        alert('Ürün kaydedilirken bir hata oluştu: ' + error.message);
    }
}

// Event listener'ları güncelle
function setupEventListeners() {
    // Modal kapatma düğmesi
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('productModal').style.display = 'none';
        }
    }

    // Form submit
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.onsubmit = handleProductSubmit;
    }

    // Yeni ürün ekleme butonu
    const addButton = document.querySelector('.add-product-btn');
    if (addButton) {
        addButton.onclick = () => showProductModal();
    }

    // Modal dışına tıklandığında kapatma
    window.onclick = function(event) {
        const modal = document.getElementById('productModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// Ürün listesini yükleme
async function loadProducts() {
    try {
        console.log('Ürünler yükleniyor...');
        const response = await fetch('/api/products', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Sunucu yanıtı:', response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ürünler yüklenemedi');
        }

        const products = await response.json();
        console.log('Yüklenen ürünler:', products);

        if (!Array.isArray(products)) {
            throw new Error('Sunucudan gelen veri ürün dizisi değil');
        }

        updateProductList(products);
    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        document.getElementById('productList').innerHTML = `
            <div class="error-message">
                <p>Ürünler yüklenirken bir hata oluştu</p>
                <p>Hata detayı: ${error.message}</p>
                <button onclick="loadProducts()">Tekrar Dene</button>
            </div>
        `;
    }
}

// Ürün listesini güncelleme
function updateProductList(products) {
    const productList = document.getElementById('productList');
    
    if (!products || products.length === 0) {
        productList.innerHTML = '<p class="no-products">Henüz ürün bulunmamaktadır.</p>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="product-item" data-id="${product.id}">
            <img src="${product.imageUrl || '/images/default-product.jpg'}" 
                 alt="${product.name}"
                 onerror="this.src='/images/default-product.jpg'">
            <h3>${product.name || 'İsimsiz Ürün'}</h3>
            <p class="description">${product.description || 'Açıklama yok'}</p>
            <p class="price">Fiyat: ${product.price?.toFixed(2) || 0} TL</p>
            <p class="stock">Stok: ${product.stock || 0}</p>
            <p class="brand">Marka: ${product.brand || 'Belirtilmemiş'}</p>
            <div class="actions">
                <button onclick="editProduct('${product.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button onclick="confirmDelete('${product.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');
}