document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const productListDiv = document.querySelector('#product-list .products-grid');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpanHeader = document.getElementById('cart-total');
    const cartTotalSpanBottom = document.getElementById('cart-total-bottom');
    const checkoutButton = document.getElementById('checkout-button');
    const emptyCartMessage = document.getElementById('empty-cart');

    let products = loadProducts();
    let cart = loadCart();

    // Function to save products to local storage
    function saveProducts() {
        localStorage.setItem('groceryStoreProducts', JSON.stringify(products));
    }

    // Function to load products from local storage
    function loadProducts() {
        const storedProducts = localStorage.getItem('groceryStoreProducts');
        return storedProducts ? JSON.parse(storedProducts) : [];
    }

    // Function to save cart to local storage
    function saveCart() {
        localStorage.setItem('groceryStoreCart', JSON.stringify(cart));
    }

    // Function to load cart from local storage
    function loadCart() {
        const storedCart = localStorage.getItem('groceryStoreCart');
        return storedCart ? JSON.parse(storedCart) : [];
    }

    // Function to display products (only on user.html)
    function displayProducts() {
        if (!productListDiv) return; // Only run if product list exists

        productListDiv.innerHTML = '';
        if (products.length === 0) {
            productListDiv.innerHTML = '<p>No products available.</p>';
            return;
        }
        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price.toFixed(2)}</p>
                <p class="description">${product.description}</p>
                <button class="add-to-cart" data-product-id="${index}">Add to Cart</button>
            `;
            productListDiv.appendChild(productCard);
        });

        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.productId);
                addToCart(products[productId]);
            });
        });
    }

    // Function to add a product to the cart (only on user.html)
    function addToCart(product) {
        if (!cartItemsDiv) return; // Only run if cart elements exist

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, id: products.indexOf(product), quantity: 1 });
        }
        saveCart();
        updateCartDisplay();
    }

    // Function to remove an item from the cart (only on user.html)
    function removeFromCart(productId) {
        if (!cartItemsDiv) return; // Only run if cart elements exist

        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
    }

    // Function to update the cart display (only on user.html)
    function updateCartDisplay() {
        if (!cartItemsDiv) return; // Only run if cart elements exist

        cartItemsDiv.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutButton.disabled = false;
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name} (${item.quantity})</h4>
                        <p class="item-price">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-from-cart" data-product-id="${item.id}">Remove</button>
                `;
                cartItemsDiv.appendChild(cartItemDiv);
                total += item.price * item.quantity;
            });

            const removeFromCartButtons = document.querySelectorAll('.remove-from-cart');
            removeFromCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.dataset.productId);
                    removeFromCart(productId);
                });
            });
        }

        if (cartCountSpan) cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartTotalSpanHeader) cartTotalSpanHeader.textContent = total.toFixed(2);
        if (cartTotalSpanBottom) cartTotalSpanBottom.textContent = total.toFixed(2);
    }

    // Event listener for the product upload form (only on seller.html)
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const imageUrl = document.getElementById('product-image').value;
            const name = document.getElementById('product-name').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const description = document.getElementById('product-description').value;

            const newProduct = {
                image: imageUrl,
                name: name,
                price: price,
                description: description,
                id: Date.now() // Simple unique ID
            };

            products.push(newProduct);
            saveProducts();
            uploadForm.reset();
            alert(`Product "${name}" uploaded successfully!`);
        });
    }

    // Basic checkout functionality (only on user.html)
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length > 0) {
                alert(`Checkout successful! Total amount: ₹${cartTotalSpanBottom.textContent}`);
                cart = [];
                saveCart();
                updateCartDisplay();
            } else {
                alert('Your cart is empty.');
            }
        });
    }

    // Initial display of products and cart (run on both pages, but will only affect user.html)
    displayProducts();
    updateCartDisplay();
});