// ===========================================
// TONNINYIRA - Complete JavaScript Logic
// ===========================================

// ===== STATE MANAGEMENT =====
const AppState = {
  cart: [],
  selectedZone: 'local',
  selectedArea: 'kisugu',
  deliveryOption: 'standard',
  
  // Delivery fees by area (in UGX)
  deliveryFees: {
    kisugu: 1000,
    kansanga: 1000,
    ggaba: 1500,
    namwongo: 1000,
    entebbe: 3000,
    kasangati: 3000,
    jinja: 5000,
  },

  // Round-trip taxi costs by area (for savings calculation)
  taxiFares: {
    kisugu: 5000,
    kansanga: 5000,
    ggaba: 6000,
    namwongo: 5000,
    entebbe: 12000,
    kasangati: 12000,
    jinja: 15000,
  },

  // Product data
  products: {
    local: [
      {
        id: 'local-1',
        name: 'Fresh Posho (1kg)',
        description: 'Ground corn flour',
        price: 3500,
        icon: '🌽',
        zone: 'local',
      },
      {
        id: 'local-2',
        name: 'Dry Beans (2kg)',
        description: 'Broken portions',
        price: 6000,
        icon: '🫘',
        zone: 'local',
      },
      {
        id: 'local-3',
        name: 'Fresh Tomatoes',
        description: 'Heap (30+ pieces)',
        price: 4000,
        icon: '🍅',
        zone: 'local',
      },
      {
        id: 'local-4',
        name: 'Onions Bunch',
        description: '5-6 bulbs',
        price: 2500,
        icon: '🧅',
        zone: 'local',
      },
      {
        id: 'local-5',
        name: 'Cooking Oil (1L)',
        description: 'Grade-A vegetable oil',
        price: 5000,
        icon: '🫗',
        zone: 'local',
      },
      {
        id: 'local-6',
        name: 'Sugar (500g)',
        description: 'Fine white sugar',
        price: 3000,
        icon: '🍬',
        zone: 'local',
      },
      {
        id: 'local-7',
        name: 'Eggs (15 pieces)',
        description: 'Fresh chicken eggs',
        price: 7000,
        icon: '🥚',
        zone: 'local',
      },
      {
        id: 'local-8',
        name: 'Maize Flour (2kg)',
        description: 'Milled maize',
        price: 4500,
        icon: '🌾',
        zone: 'local',
      },
    ],
    central: [
      {
        id: 'central-1',
        name: 'Grade-A Jacket',
        description: 'Mitumba, winter wear',
        price: 8000,
        icon: '🧥',
        zone: 'central',
      },
      {
        id: 'central-2',
        name: 'Denim Jeans',
        description: 'Mitumba, all sizes',
        price: 7500,
        icon: '👖',
        zone: 'central',
      },
      {
        id: 'central-3',
        name: 'T-Shirt Bundle',
        description: '3 pieces, assorted',
        price: 9000,
        icon: '👕',
        zone: 'central',
      },
      {
        id: 'central-4',
        name: 'Sports Shoes',
        description: 'Mitumba, Grade-B',
        price: 10000,
        icon: '👟',
        zone: 'central',
      },
      {
        id: 'central-5',
        name: 'Sweater/Pullover',
        description: 'Mitumba, winter',
        price: 7000,
        icon: '🧶',
        zone: 'central',
      },
      {
        id: 'central-6',
        name: 'Casual Shoes',
        description: 'Mitumba, all sizes',
        price: 8500,
        icon: '👞',
        zone: 'central',
      },
      {
        id: 'central-7',
        name: 'Bed Sheet Set',
        description: 'Cotton, 2-piece set',
        price: 12000,
        icon: '🛏️',
        zone: 'central',
      },
      {
        id: 'central-8',
        name: 'Kitchen Utensils',
        description: 'Mixed bundle (plates, cups)',
        price: 15000,
        icon: '🍳',
        zone: 'central',
      },
    ],
  },
};

// ===== DOM ELEMENT REFERENCES =====
const DOM = {
  // Header & Navigation
  headerArea: document.getElementById('areaSelect'),
  cartBtn: document.getElementById('cartBtn'),
  cartCount: document.getElementById('cartCount'),

  // Zone tabs
  zoneTabs: document.querySelectorAll('.zone-tab'),
  zoneContents: document.querySelectorAll('.zone-content'),
  localGrid: document.getElementById('localGrid'),
  centralGrid: document.getElementById('centralGrid'),

  // Cart Panel
  cartPanel: document.getElementById('cartPanel'),
  cartPanelOverlay: document.querySelector('.cart-panel-overlay'),
  closeCartBtn: document.getElementById('closeCartBtn'),
  cartItemsList: document.getElementById('cartItemsList'),
  floatingCart: document.getElementById('floatingCart'),
  floatingCartBtn: document.getElementById('floatingCartBtn'),
  floatingTotal: document.getElementById('floatingTotal'),
  continueShoppingBtn: document.getElementById('continueShoppingBtn'),

  // Delivery & Savings
  standardFeeDisplay: document.getElementById('standardFeeDisplay'),
  savingsItems: document.getElementById('savingsItems'),
  savingsDelivery: document.getElementById('savingsDelivery'),
  savingsTonninyira: document.getElementById('savingsTonninyira'),
  physicalTripCost: document.getElementById('physicalTripCost'),
  netSavings: document.getElementById('netSavings'),

  // Checkout
  checkoutBtn: document.getElementById('checkoutBtn'),
  revenueModalBtn: document.getElementById('revenueModalBtn'),

  // Modals
  revenueModal: document.getElementById('revenueModal'),
  paymentModal: document.getElementById('paymentModal'),
  confirmationModal: document.getElementById('confirmationModal'),
  modals: document.querySelectorAll('.modal'),
  modalCloses: document.querySelectorAll('.modal-close'),

  // Revenue Modal elements
  modalSubtotal: document.getElementById('modalSubtotal'),
  modalDeliveryFee: document.getElementById('modalDeliveryFee'),
  modalOrderTotal: document.getElementById('modalOrderTotal'),
  modalVendorCommission: document.getElementById('modalVendorCommission'),
  modalDeliveryCommission: document.getElementById('modalDeliveryCommission'),
  modalTotalMargin: document.getElementById('modalTotalMargin'),
  modalMarginPercent: document.getElementById('modalMarginPercent'),
  vendorCommissionBar: document.getElementById('vendorCommissionBar'),
  deliveryCommissionBar: document.getElementById('deliveryCommissionBar'),

  // Payment options
  paymentOptions: document.querySelectorAll('.payment-option'),

  // Confirmation modal
  confirmationOrderId: document.getElementById('confirmationOrderId'),
  confirmationSummary: document.getElementById('confirmationSummary'),
  confirmationCloseBtn: document.getElementById('confirmationCloseBtn'),

  // Templates
  productTemplate: document.getElementById('productTemplate'),
};

// ===== INITIALIZATION =====
function init() {
  renderProducts();
  setupEventListeners();
  updateCartDisplay();
  updateDeliveryFeeDisplay();
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  // Clear grids
  DOM.localGrid.innerHTML = '';
  DOM.centralGrid.innerHTML = '';

  // Render local market products
  AppState.products.local.forEach((product) => {
    DOM.localGrid.appendChild(createProductCard(product));
  });

  // Render central hub products
  AppState.products.central.forEach((product) => {
    DOM.centralGrid.appendChild(createProductCard(product));
  });
}

// ===== CREATE PRODUCT CARD =====
function createProductCard(product) {
  const card = DOM.productTemplate.content.cloneNode(true);

  // Populate product data
  card.querySelector('h3').textContent = product.name;
  card.querySelector('p').textContent = product.description;
  card.querySelector('.bg-gradient-to-br').textContent = product.icon;
  card.querySelector('.text-orange-600').textContent = `UGX ${formatPrice(product.price)}`;

  // Add to cart button
  const addBtn = card.querySelector('.add-to-cart');
  addBtn.addEventListener('click', () => {
    addToCart(product);
    animateAddToCart(addBtn);
  });

  return card;
}

// ===== ADD TO CART =====
function addToCart(product) {
  const existingItem = AppState.cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    AppState.cart.push({
      ...product,
      quantity: 1,
    });
  }

  updateCartDisplay();
  showFloatingCart();
}

// ===== REMOVE FROM CART =====
function removeFromCart(productId) {
  AppState.cart = AppState.cart.filter((item) => item.id !== productId);
  updateCartDisplay();
}

// ===== UPDATE ITEM QUANTITY =====
function updateItemQuantity(productId, quantity) {
  const item = AppState.cart.find((item) => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
    }
    updateCartDisplay();
  }
}

// ===== UPDATE CART DISPLAY =====
function updateCartDisplay() {
  // Update cart count badge
  const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  DOM.cartCount.textContent = totalItems;

  // Update cart items list
  if (AppState.cart.length === 0) {
    DOM.cartItemsList.innerHTML = '<p class="text-center text-gray-500 py-8">Your basket is empty</p>';
  } else {
    DOM.cartItemsList.innerHTML = AppState.cart
      .map(
        (item) => `
        <div class="cart-item bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start gap-3">
          <div class="text-3xl flex-shrink-0">${item.icon}</div>
          <div class="flex-1">
            <h4 class="font-semibold text-sm text-gray-900">${item.name}</h4>
            <p class="text-xs text-gray-500 mt-1">${item.description}</p>
            <div class="flex items-center gap-2 mt-2">
              <button class="qty-minus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-1 rounded text-xs" data-id="${item.id}">-</button>
              <span class="qty-display font-semibold text-gray-900 w-8 text-center">${item.quantity}</span>
              <button class="qty-plus bg-orange-500 hover:bg-orange-600 text-white font-bold px-2 py-1 rounded text-xs" data-id="${item.id}">+</button>
              <span class="ml-auto font-bold text-orange-600">UGX ${formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
          <button class="cart-item-remove text-gray-400 hover:text-red-500 text-lg font-bold" data-id="${item.id}">✕</button>
        </div>
      `
      )
      .join('');

    // Attach quantity handlers
    document.querySelectorAll('.qty-minus').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const item = AppState.cart.find((i) => i.id === id);
        if (item) updateItemQuantity(id, item.quantity - 1);
      });
    });

    document.querySelectorAll('.qty-plus').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const item = AppState.cart.find((i) => i.id === id);
        if (item) updateItemQuantity(id, item.quantity + 1);
      });
    });

    document.querySelectorAll('.cart-item-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        removeFromCart(id);
      });
    });
  }

  // Update totals and savings
  updateSavingsCalculator();
  updateFloatingCart();
  updateRevenueModal();
}

// ===== UPDATE SAVINGS CALCULATOR =====
function updateSavingsCalculator() {
  const itemsTotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee();
  const tonninyiraTotal = itemsTotal + deliveryFee;

  // Get taxi fare for round trip
  const taxiFare = AppState.taxiFares[AppState.selectedArea];
  const physicalTripTotal = itemsTotal + taxiFare;

  const netSavings = physicalTripTotal - tonninyiraTotal;

  // Update display
  DOM.savingsItems.textContent = `UGX ${formatPrice(itemsTotal)}`;
  DOM.savingsDelivery.textContent = `UGX ${formatPrice(deliveryFee)}`;
  DOM.savingsTonninyira.textContent = `UGX ${formatPrice(tonninyiraTotal)}`;
  DOM.physicalTripCost.textContent = `UGX ${formatPrice(physicalTripTotal)}`;
  DOM.netSavings.textContent = `UGX ${formatPrice(netSavings)}`;

  // Style net savings based on value
  if (netSavings > 0) {
    DOM.netSavings.parentElement.className = 'bg-green-100 p-2 rounded mt-2 border-l-4 border-green-600';
  } else if (netSavings === 0) {
    DOM.netSavings.parentElement.className = 'bg-yellow-100 p-2 rounded mt-2 border-l-4 border-yellow-600';
  } else {
    DOM.netSavings.parentElement.className = 'bg-red-100 p-2 rounded mt-2 border-l-4 border-red-600';
  }
}

// ===== UPDATE REVENUE MODAL =====
function updateRevenueModal() {
  const itemsTotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee();
  const orderTotal = itemsTotal + deliveryFee;

  // Calculate commissions
  const vendorCommission = Math.round(itemsTotal * 0.03); // 3% vendor cut
  const deliveryCommission = Math.round(deliveryFee * 0.15); // 15% of delivery fee
  const totalMargin = vendorCommission + deliveryCommission;

  const marginPercent = orderTotal > 0 ? Math.round((totalMargin / orderTotal) * 100) : 0;

  // Update modal elements
  DOM.modalSubtotal.textContent = `UGX ${formatPrice(itemsTotal)}`;
  DOM.modalDeliveryFee.textContent = `UGX ${formatPrice(deliveryFee)}`;
  DOM.modalOrderTotal.textContent = `UGX ${formatPrice(orderTotal)}`;
  DOM.modalVendorCommission.textContent = `UGX ${formatPrice(vendorCommission)}`;
  DOM.modalDeliveryCommission.textContent = `UGX ${formatPrice(deliveryCommission)}`;
  DOM.modalTotalMargin.textContent = `UGX ${formatPrice(totalMargin)}`;
  DOM.modalMarginPercent.textContent = `${marginPercent}%`;

  // Update progress bars
  const vendorPercent = totalMargin > 0 ? (vendorCommission / totalMargin) * 100 : 0;
  const deliveryPercent = totalMargin > 0 ? (deliveryCommission / totalMargin) * 100 : 0;

  DOM.vendorCommissionBar.style.width = `${vendorPercent}%`;
  DOM.deliveryCommissionBar.style.width = `${deliveryPercent}%`;
}

// ===== UPDATE FLOATING CART =====
function updateFloatingCart() {
  const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  DOM.floatingTotal.textContent = `UGX ${formatPrice(totalPrice)}`;
}

// ===== SHOW/HIDE FLOATING CART =====
function showFloatingCart() {
  if (AppState.cart.length > 0) {
    DOM.floatingCart.classList.remove('hidden');
  }
}

function hideFloatingCart() {
  DOM.floatingCart.classList.add('hidden');
}

// ===== GET DELIVERY FEE =====
function getDeliveryFee() {
  const baseFee = AppState.deliveryFees[AppState.selectedArea] || 1000;
  const expressFee = AppState.deliveryOption === 'express' ? 2000 : 0;
  return baseFee + expressFee;
}

// ===== UPDATE DELIVERY FEE DISPLAY =====
function updateDeliveryFeeDisplay() {
  const fee = AppState.deliveryFees[AppState.selectedArea] || 1000;
  DOM.standardFeeDisplay.textContent = `UGX ${formatPrice(fee)}`;
  updateSavingsCalculator();
}

// ===== FORMAT PRICE =====
function formatPrice(amount) {
  return Math.round(amount).toLocaleString('en-UG');
}

// ===== GENERATE ORDER ID =====
function generateOrderId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TN-${timestamp}${random}`;
}

// ===== SHOW PAYMENT MODAL =====
function showPaymentModal() {
  if (AppState.cart.length === 0) {
    alert('Your basket is empty!');
    return;
  }
  closeAllModals();
  DOM.paymentModal.classList.add('active');
}

// ===== SHOW CONFIRMATION MODAL =====
function showConfirmationModal() {
  const orderId = generateOrderId();
  const itemsTotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee();
  const orderTotal = itemsTotal + deliveryFee;

  // Populate confirmation details
  DOM.confirmationOrderId.textContent = orderId;

  const summaryHTML = `
    <div class="space-y-2">
      ${AppState.cart.map((item) => `<div class="flex justify-between"><span>${item.name} x${item.quantity}</span><span>UGX ${formatPrice(item.price * item.quantity)}</span></div>`).join('')}
      <div class="border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold">
        <span>Delivery Fee:</span>
        <span>UGX ${formatPrice(deliveryFee)}</span>
      </div>
      <div class="flex justify-between font-bold text-lg text-green-700">
        <span>Total:</span>
        <span>UGX ${formatPrice(orderTotal)}</span>
      </div>
    </div>
  `;

  DOM.confirmationSummary.innerHTML = summaryHTML;

  closeAllModals();
  DOM.confirmationModal.classList.add('active');

  // Clear cart after showing confirmation
  setTimeout(() => {
    AppState.cart = [];
    updateCartDisplay();
    hideFloatingCart();
  }, 1000);
}

// ===== CLOSE ALL MODALS =====
function closeAllModals() {
  DOM.modals.forEach((modal) => {
    modal.classList.remove('active');
  });
  DOM.cartPanel.classList.remove('active');
}

// ===== ANIMATE ADD TO CART =====
function animateAddToCart(button) {
  button.classList.add('scale-110');
  button.textContent = '✓ Added!';
  button.disabled = true;

  setTimeout(() => {
    button.classList.remove('scale-110');
    button.textContent = 'Add to Basket';
    button.disabled = false;
  }, 1500);
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
  // Cart button
  DOM.cartBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.add('active');
  });

  DOM.floatingCartBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.add('active');
  });

  // Close cart panel
  DOM.closeCartBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
  });

  DOM.cartPanelOverlay.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
  });

  DOM.continueShoppingBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
  });

  // Area selector
  DOM.headerArea.addEventListener('change', (e) => {
    AppState.selectedArea = e.target.value;
    updateDeliveryFeeDisplay();
    updateCartDisplay();
  });

  // Zone tabs
  DOM.zoneTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      DOM.zoneTabs.forEach((t) => t.classList.remove('active'));
      DOM.zoneContents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const zone = tab.dataset.zone;
      AppState.selectedZone = zone;

      if (zone === 'local') {
        document.getElementById('localZone').classList.add('active');
      } else {
        document.getElementById('centralZone').classList.add('active');
      }
    });
  });

  // Delivery option radio buttons
  document.querySelectorAll('input[name="deliveryOption"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      AppState.deliveryOption = e.target.value;
      updateCartDisplay();
    });
  });

  // Checkout button
  DOM.checkoutBtn.addEventListener('click', showPaymentModal);

  // Revenue modal button
  DOM.revenueModalBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
    closeAllModals();
    DOM.revenueModal.classList.add('active');
  });

  // Payment options
  DOM.paymentOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      closeAllModals();
      showConfirmationModal();
    });
  });

  // Modal close buttons
  DOM.modalCloses.forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  // Modal backdrop clicks
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Confirmation close button
  DOM.confirmationCloseBtn.addEventListener('click', () => {
    closeAllModals();
  });

  // Delivery option label styling
  document.querySelectorAll('.delivery-option-label').forEach((label) => {
    label.addEventListener('change', () => {
      document.querySelectorAll('.delivery-option-label').forEach((l) => {
        l.classList.remove('border-orange-300');
        l.classList.add('border-gray-200');
      });
      label.classList.add('border-orange-300');
      label.classList.remove('border-gray-200');
    });
  });

  // Prevent body scroll when modals are open
  document.addEventListener('click', (e) => {
    if (DOM.cartPanel.classList.contains('active') || DOM.revenueModal.classList.contains('active') || DOM.paymentModal.classList.contains('active') || DOM.confirmationModal.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  // ESC to close modals
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

// ===== INITIALIZE APP ON LOAD =====
document.addEventListener('DOMContentLoaded', init);

// ===== HANDLE VISIBILITY CHANGE =====
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // App goes to background - could pause animations
  } else {
    // App returns to foreground
  }
});

// ===== PERFORMANCE: LAZY LOAD & DEBOUNCE =====
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Debounce resize handler
window.addEventListener(
  'resize',
  debounce(() => {
    // Handle responsive adjustments if needed
  }, 250)
);

// ===== CONSOLE LOGGING FOR DEBUGGING =====
console.log('🚀 Tonninyira App Initialized');
console.log('📊 State:', AppState);
console.log('💡 Tips: Open cart, add items, switch zones, check savings!');
