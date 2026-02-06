// ========== ORDER MANAGEMENT ==========

// Order data structure
class Order {
    constructor() {
        this.items = [];
        this.customer = {};
        this.delivery = {};
        this.payment = {};
        this.status = 'pending';
        this.timestamp = new Date().toISOString();
        this.orderId = this.generateOrderId();
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `HS${timestamp}${random}`;
    }
}

// Create order from cart
function createOrderFromCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return null;
    }

    const order = new Order();
    order.items = cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
    }));

    return order;
}

// Calculate order summary
function calculateOrderSummary(order) {
    const subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = 40;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + tax;

    return {
        subtotal,
        deliveryFee,
        tax,
        total
    };
}

// Validate order details
function validateOrder(order) {
    const errors = [];

    // Validate customer details
    if (!order.customer.name || order.customer.name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!order.customer.email || !validateEmail(order.customer.email)) {
        errors.push('Valid email is required');
    }

    if (!order.customer.phone || !validatePhone(order.customer.phone)) {
        errors.push('Valid phone number is required');
    }

    // Validate delivery details
    if (!order.delivery.address || order.delivery.address.length < 10) {
        errors.push('Delivery address is required');
    }

    // Validate payment method
    if (!order.payment.method) {
        errors.push('Payment method is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// Submit order (would connect to backend API)
async function submitOrder(order) {
    try {
        // Validate order
        const validation = validateOrder(order);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // In production, this would be an API call
        // const response = await fetch('/api/orders', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(order)
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save order to localStorage for demo
        const orders = getOrders();
        orders.push(order);
        localStorage.setItem('hotel_sipayi_orders', JSON.stringify(orders));

        // Clear cart after successful order
        clearCart();

        return {
            success: true,
            orderId: order.orderId,
            message: 'Order placed successfully!'
        };

    } catch (error) {
        console.error('Order submission error:', error);
        return {
            success: false,
            message: error.message || 'Failed to place order. Please try again.'
        };
    }
}

// Get all orders from localStorage
function getOrders() {
    const orders = localStorage.getItem('hotel_sipayi_orders');
    return orders ? JSON.parse(orders) : [];
}

// Get order by ID
function getOrderById(orderId) {
    const orders = getOrders();
    return orders.find(order => order.orderId === orderId);
}

// Track order status
function getOrderStatus(orderId) {
    const order = getOrderById(orderId);
    if (!order) {
        return null;
    }

    // Simulate order status progression
    const statuses = [
        { status: 'pending', label: 'Order Received', time: 0 },
        { status: 'confirmed', label: 'Order Confirmed', time: 2 },
        { status: 'preparing', label: 'Preparing Food', time: 15 },
        { status: 'ready', label: 'Ready for Pickup', time: 30 },
        { status: 'delivered', label: 'Delivered', time: 45 }
    ];

    return {
        orderId: order.orderId,
        currentStatus: order.status,
        statuses
    };
}

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toFixed(0)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        window.location.href = 'menu.html';
        return;
    }

    // In a real application, this would navigate to checkout page
    // For now, show order summary
    const order = createOrderFromCart();
    const summary = calculateOrderSummary(order);

    alert(`Order Summary:\n\nSubtotal: ${formatCurrency(summary.subtotal)}\nDelivery: ${formatCurrency(summary.deliveryFee)}\nTax: ${formatCurrency(summary.tax)}\nTotal: ${formatCurrency(summary.total)}\n\nNote: Checkout page would be implemented here.`);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Order,
        createOrderFromCart,
        calculateOrderSummary,
        validateOrder,
        submitOrder,
        getOrders,
        getOrderById,
        getOrderStatus,
        formatCurrency,
        proceedToCheckout
    };
}