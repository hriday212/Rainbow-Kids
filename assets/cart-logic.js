/**
 * Rainbow Kids Hub - Premium Cart Logic
 * Handles Ajax Add to Cart and Drawer updates
 */

const cartLogic = {
  // 1. Add item to Shopify cart
  async addItem(variantId, qty = 1) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: qty }] })
      });
      
      if (!response.ok) throw new Error('Cart add failed');
      
      const cart = await response.json();
      console.log('Added to cart:', cart);
      
      // Refresh the drawer UI
      await this.updateDrawer();
      
      // Open drawer and celebrate
      if (window.openCart) window.openCart();
      if (window.celebrate) window.celebrate();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  },

  // 2. Fetch current cart and update the drawer HTML
  async updateDrawer() {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    
    const content = document.getElementById('CartContent');
    const count = document.querySelector('.header__cart-count');
    const subtotal = document.querySelector('.cart-drawer__subtotal span:last-child');
    
    // Update counter
    if (count) count.innerText = cart.item_count;

    // Update subtotal
    if (subtotal) subtotal.innerText = this.formatMoney(cart.total_price);

    if (cart.item_count === 0) {
      content.innerHTML = `
        <div class="cart-item-empty">
          <span style="font-size: 3rem; display: block; margin-bottom: 20px;">🛍️</span>
          <p>Your bag is currently empty.</p>
          <a href="/collections/all" class="button button--outline" style="margin-top: 20px;">Start Shopping</a>
        </div>
      `;
      return;
    }

    // Build item list
    let html = '';
    cart.items.forEach(item => {
      html += `
        <div class="cart-item" style="display: flex; gap: 15px; padding-bottom: 15px; border-bottom: 1px solid #f4f4f4; margin-bottom: 15px;">
          <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 5px; font-size: 0.9rem;">${item.product_title}</h4>
            <p style="font-size: 0.8rem; color: #999; margin: 0;">${item.variant_title || ''}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <span style="font-size: 0.85rem; font-weight: 700;">${this.formatMoney(item.price)} x ${item.quantity}</span>
              <button onclick="cartLogic.removeItem(${item.key})" style="background:none; border:none; color:#ff4d4d; font-size:0.7rem; cursor:pointer; text-decoration:underline;">Remove</button>
            </div>
          </div>
        </div>
      `;
    });
    content.innerHTML = html;
  },

  // 3. Remove item from cart
  async removeItem(key) {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: 0 })
    });
    this.updateDrawer();
  },

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
};

// Initial update on load
window.addEventListener('load', () => cartLogic.updateDrawer());
window.cartLogic = cartLogic;
