function syncCartBadge() {
    const savedCart = localStorage.getItem('shopping_cart');
    let cartData = [];

    try {
        cartData = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        cartData = [];
    }

    const totalQty = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const qtyDisplays = document.querySelectorAll('#cart-total-qty');

    qtyDisplays.forEach((qtyDisplay) => {
        qtyDisplay.innerText = `${totalQty} ชิ้น`;
    });
}

document.addEventListener('DOMContentLoaded', syncCartBadge);
