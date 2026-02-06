// ========== CART MANAGEMENT ==========

// Initialize cart from localStorage
function getCart() {
    const cart = localStorage.getItem('hotel_sipayi_cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('hotel_sipayi_cart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(name, price) {
    const cart = getCart();
    
    // Check if item already exists
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            id: Date.now()
        });
    }
    
    saveCart(cart);
    showNotification(`${name} added to cart!`);
    
    return true;
}

// Remove item from cart
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

// Update item quantity
function updateQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart(cart);
}

// Clear entire cart
function clearCart() {
    localStorage.removeItem('hotel_sipayi_cart');
    updateCartCount();
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Update cart count in UI
function updateCartCount() {
    const countElements = document.querySelectorAll('#cartCount');
    const count = getCartItemCount();
    
    countElements.forEach(element => {
        if (element) {
            element.textContent = count;
        }
    });
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    
    if (notification) {
        const textElement = document.getElementById('notificationText');
        if (textElement) {
            textElement.textContent = message;
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCart,
        saveCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        updateCartCount
    };
}