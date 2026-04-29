/**
 * Rainbow Kids - Premium Cart Logic
 * Handles Ajax Add-to-Cart, Progress Bar, and Drawer Updates
 */

class CartEngine {
  constructor() {
    this.drawer = document.getElementById('CartDrawer');
    this.overlay = document.getElementById('CartOverlay');
    this.content = document.getElementById('CartContent');
    this.subtotalEl = document.getElementById('CartSubtotal');
    this.countEl = document.querySelector('.header__cart-count');
    this.shippingMsg = document.getElementById('ShippingMessage');
    this.shippingProgress = document.getElementById('ShippingProgress');
    this.shippingThreshold = 100; // $100 for free shipping

    this.init();
  }

  init() {
    // Global Add to Cart listener
    document.addEventListener('click', (e) => {
      const atcBtn = e.target.closest('.js-add-to-cart') || e.target.closest('.product-card__atc');
      if (atcBtn) {
        e.preventDefault();
        const variantId = atcBtn.getAttribute('data-variant-id');
        if (variantId) this.addItem(variantId);
      }

      // Close drawer on overlay click
      if (e.target === this.overlay || e.target.closest('#CartClose')) {
        this.close();
      }
    });

    // Toggle drawer
    const toggle = document.getElementById('CartToggle');
    if (toggle) toggle.addEventListener('click', () => this.open());

    // Initial fetch
    this.refresh();
  }

  async addItem(id, qty = 1) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: id, quantity: qty }] })
      });
      const data = await response.json();
      this.refresh();
      this.open();
    } catch (err) {
      console.error('Add to Cart Error:', err);
    }
  }

  async refresh() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      this.render(cart);
      this.updateShipping(cart.total_price / 100);
    } catch (err) {
      console.error('Cart Refresh Error:', err);
    }
  }

  render(cart) {
    if (cart.item_count === 0) {
      this.content.innerHTML = `<div class="cart-item-empty">🧸<p>Your bag is empty</p></div>`;
      if (this.subtotalEl) this.subtotalEl.innerText = '$0.00';
      if (this.countEl) this.countEl.innerText = '0';
      return;
    }

    if (this.countEl) this.countEl.innerText = cart.item_count;
    if (this.subtotalEl) this.subtotalEl.innerText = `$${(cart.total_price / 100).toFixed(2)}`;

    let html = '';
    cart.items.forEach(item => {
      html += `
        <div class="cart-item" style="display:flex; gap:15px; padding-bottom:15px; border-bottom:1px solid #f9f9f9;">
          <img src="${item.image}" style="width:70px; border-radius:8px;">
          <div style="flex:1;">
            <h4 style="font-size:0.9rem; margin:0;">${item.product_title}</h4>
            <p style="font-size:0.8rem; color:#888;">${item.variant_title || ''}</p>
            <p style="font-weight:700;">${(item.price / 100).toFixed(2)}</p>
          </div>
        </div>
      `;
    });
    this.content.innerHTML = html;
  }

  updateShipping(total) {
    if (!this.shippingMsg) return;
    const remaining = this.shippingThreshold - total;
    if (remaining <= 0) {
      this.shippingMsg.innerText = "🎉 You've unlocked FREE Shipping!";
      this.shippingProgress.style.width = '100%';
    } else {
      this.shippingMsg.innerText = `You are $${remaining.toFixed(2)} away from FREE Shipping!`;
      this.shippingProgress.style.width = `${(total / this.shippingThreshold) * 100}%`;
    }
  }

  open() {
    this.drawer.classList.add('active');
    this.overlay.classList.add('active');
  }

  close() {
    this.drawer.classList.remove('active');
    this.overlay.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartEngine = new CartEngine();
});
