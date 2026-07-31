// ===========================================
// TONNINYIRA - Supabase Backend Integration
// ===========================================

// ===== SUPABASE CONFIGURATION =====
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== STATE MANAGEMENT =====
const AppState = {
  cart: [],
  selectedZone: 'local',
  selectedArea: 'kisugu',
  deliveryOption: 'standard',
  currentUser: null,
  
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
    fastfood: [
      {
        id: 'ff-1',
        name: 'Rolex (Chapati Roll)',
        description: 'Egg + vegetable wrapped in chapati',
        price: 2000,
        icon: '🌯',
        zone: 'fastfood',
      },
      {
        id: 'ff-2',
        name: 'Posho & Beans',
        description: 'Ready-to-eat meal',
        price: 3500,
        icon: '🍲',
        zone: 'fastfood',
      },
      {
        id: 'ff-3',
        name: 'Rice & Stew',
        description: 'With meat/chicken pieces',
        price: 4000,
        icon: '🍚',
        zone: 'fastfood',
      },
      {
        id: 'ff-4',
        name: 'Fried Chicken Pieces',
        description: '5-6 pieces (crispy)',
        price: 5000,
        icon: '🍗',
        zone: 'fastfood',
      },
      {
        id: 'ff-5',
        name: 'Ugali & Vegetables',
        description: 'With sukuma wiki & sauce',
        price: 3000,
        icon: '🥔',
        zone: 'fastfood',
      },
      {
        id: 'ff-6',
        name: 'Samosa Pack',
        description: '5 pieces (meat or veg)',
        price: 2500,
        icon: '🥟',
        zone: 'fastfood',
      },
      {
        id: 'ff-7',
        name: 'Chapati & Curry',
        description: '2 chapatis + sauce',
        price: 3500,
        icon: '🫓',
        zone: 'fastfood',
      },
      {
        id: 'ff-8',
        name: 'Chicken Soup',
        description: 'With rice or posho',
        price: 4500,
        icon: '🍲',
        zone: 'fastfood',
      },
      {
        id: 'ff-9',
        name: 'Matoke & Fish',
        description: 'Steamed plantain + fish',
        price: 6000,
        icon: '🍌',
        zone: 'fastfood',
      },
      {
        id: 'ff-10',
        name: 'Beans on Toast',
        description: 'With toast slices',
        price: 2500,
        icon: '🍞',
        zone: 'fastfood',
      },
      {
        id: 'ff-11',
        name: 'Beef Skewers',
        description: '3-4 sticks grilled',
        price: 5500,
        icon: '🍢',
        zone: 'fastfood',
      },
      {
        id: 'ff-12',
        name: 'Mandazi Pack',
        description: '6 pieces (sweet fried bread)',
        price: 2000,
        icon: '🍩',
        zone: 'fastfood',
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
  userMenuBtn: document.getElementById('userMenuBtn'),

  // Zone tabs
  zoneTabs: document.querySelectorAll('.zone-tab'),
  zoneContents: document.querySelectorAll('.zone-content'),
  localGrid: document.getElementById('localGrid'),
  fastfoodGrid: document.getElementById('fastfoodGrid'),
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
  loginModal: document.getElementById('loginModal'),
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

  // Login modal
  loginPhone: document.getElementById('loginPhone'),
  loginEmail: document.getElementById('loginEmail'),
  loginSubmitBtn: document.getElementById('loginSubmitBtn'),
  agreeTerms: document.getElementById('agreeTerms'),

  // Templates
  productTemplate: document.getElementById('productTemplate'),
};

// ===== INITIALIZATION =====
async function init() {
  console.log('🚀 Tonninyira App Initializing...');
  
  // Check for existing user
  await checkAuthStatus();
  
  // Render products
  renderProducts();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update cart display
  updateCartDisplay();
  updateDeliveryFeeDisplay();
  
  console.log('✅ App Ready! Logged in:', AppState.currentUser?.email || 'Not logged in');
}

// ===== SUPABASE AUTHENTICATION =====
async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      AppState.currentUser = session.user;
      DOM.userMenuBtn.textContent = '✓ ' + (session.user.email?.split('@')[0] || 'User');
      return true;
    }
  } catch (error) {
    console.warn('Auth check failed:', error.message);
  }
  return false;
}

// ===== LOGIN HANDLER =====
async function handleLogin() {
  const phone = DOM.loginPhone.value.trim();
  const email = DOM.loginEmail.value.trim();
  const agreeTerms = DOM.agreeTerms.checked;

  if (!email && !phone) {
    alert('Please enter phone number or email');
    return;
  }

  if (!agreeTerms) {
    alert('Please agree to Terms & Privacy Policy');
    return;
  }

  try {
    DOM.loginSubmitBtn.disabled = true;
    DOM.loginSubmitBtn.textContent = 'Signing in...';

    // Use email for Supabase auth (phone sign-in requires configuration)
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email: email || `${phone}@tonninyira.local`,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;

    alert('Check your email for the login link!');
    closeAllModals();
    AppState.currentUser = { email: email || phone };
    DOM.userMenuBtn.textContent = '✓ ' + (email?.split('@')[0] || phone);
  } catch (error) {
    alert('Login failed: ' + error.message);
  } finally {
    DOM.loginSubmitBtn.disabled = false;
    DOM.loginSubmitBtn.textContent = 'Sign In / Create Account';
  }
}

// ===== LOGOUT HANDLER =====
async function handleLogout() {
  try {
    await supabaseClient.auth.signOut();
    AppState.currentUser = null;
    DOM.userMenuBtn.textContent = '👤';
    alert('Logged out successfully');
  } catch (error) {
    alert('Logout failed: ' + error.message);
  }
}

// ===== SAVE ORDER TO SUPABASE =====
async function saveOrderToSupabase(orderId, orderData) {
  try {
    const { error } = await supabaseClient
      .from('orders')
      .insert([
        {
          order_id: orderId,
          user_id: AppState.currentUser?.id,
          user_email: AppState.currentUser?.email,
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          delivery_area: AppState.selectedArea,
          delivery_option: AppState.deliveryOption,
          payment_method: orderData.paymentMethod,
          status: 'pending',
          created_at: new Date(),
        },
      ]);

    if (error) throw error;
    console.log('✅ Order saved to Supabase:', orderId);
  } catch (error) {
    console.error('Failed to save order:', error.message);
  }
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  DOM.localGrid.innerHTML = '';
  DOM.fastfoodGrid.innerHTML = '';
  DOM.centralGrid.innerHTML = '';

  // Render local market products
  AppState.products.local.forEach((product) => {
    DOM.localGrid.appendChild(createProductCard(product));
  });

  // Render fast food products
  AppState.products.fastfood.forEach((product) => {
    DOM.fastfoodGrid.appendChild(createProductCard(product));
  });

  // Render central hub products
  AppState.products.central.forEach((product) => {
    DOM.centralGrid.appendChild(createProductCard(product));
  });
}

// ===== CREATE PRODUCT CARD =====
function createProductCard(product) {
  const card = DOM.productTemplate.content.cloneNode(true);

  card.querySelector('h3').textContent = product.name;
  card.querySelector('p').textContent = product.description;
  card.querySelector('.bg-gradient-to-br').textContent = product.icon;
  card.querySelector('.text-orange-600').textContent = `UGX ${formatPrice(product.price)}`;

  const addBtn = card.querySelector('.add-to-cart');
  addBtn.addEventListener('click', () => {
    if (!AppState.currentUser) {
      closeAllModals();
      DOM.loginModal.classList.add('active');
      return;
    }
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
  const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  DOM.cartCount.textContent = totalItems;

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

    // Quantity button handlers
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

  updateSavingsCalculator();
  updateFloatingCart();
  updateRevenueModal();
}

// ===== UPDATE SAVINGS CALCULATOR =====
function updateSavingsCalculator() {
  const itemsTotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee();
  const tonninyiraTotal = itemsTotal + deliveryFee;

  const taxiFare = AppState.taxiFares[AppState.selectedArea];
  const physicalTripTotal = itemsTotal + taxiFare;

  const netSavings = physicalTripTotal - tonninyiraTotal;

  DOM.savingsItems.textContent = `UGX ${formatPrice(itemsTotal)}`;
  DOM.savingsDelivery.textContent = `UGX ${formatPrice(deliveryFee)}`;
  DOM.savingsTonninyira.textContent = `UGX ${formatPrice(tonninyiraTotal)}`;
  DOM.physicalTripCost.textContent = `UGX ${formatPrice(physicalTripTotal)}`;
  DOM.netSavings.textContent = `UGX ${formatPrice(netSavings)}`;

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

  const vendorCommission = Math.round(itemsTotal * 0.03);
  const deliveryCommission = Math.round(deliveryFee * 0.15);
  const totalMargin = vendorCommission + deliveryCommission;

  const marginPercent = orderTotal > 0 ? Math.round((totalMargin / orderTotal) * 100) : 0;

  DOM.modalSubtotal.textContent = `UGX ${formatPrice(itemsTotal)}`;
  DOM.modalDeliveryFee.textContent = `UGX ${formatPrice(deliveryFee)}`;
  DOM.modalOrderTotal.textContent = `UGX ${formatPrice(orderTotal)}`;
  DOM.modalVendorCommission.textContent = `UGX ${formatPrice(vendorCommission)}`;
  DOM.modalDeliveryCommission.textContent = `UGX ${formatPrice(deliveryCommission)}`;
  DOM.modalTotalMargin.textContent = `UGX ${formatPrice(totalMargin)}`;
  DOM.modalMarginPercent.textContent = `${marginPercent}%`;

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
async function showConfirmationModal(paymentMethod) {
  const orderId = generateOrderId();
  const itemsTotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee();
  const orderTotal = itemsTotal + deliveryFee;

  // Save order to Supabase
  const orderData = {
    items: AppState.cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: itemsTotal,
    deliveryFee: deliveryFee,
    total: orderTotal,
    paymentMethod: paymentMethod,
  };

  await saveOrderToSupabase(orderId, orderData);

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

  DOM.closeCartBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
  });

  DOM.cartPanelOverlay.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
  });

  DOM.continueShoppingBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
  });

  // User menu
  DOM.userMenuBtn.addEventListener('click', () => {
    if (AppState.currentUser) {
      handleLogout();
    } else {
      closeAllModals();
      DOM.loginModal.classList.add('active');
    }
  });

  // Login form
  DOM.loginSubmitBtn.addEventListener('click', handleLogin);
  DOM.loginPhone.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  DOM.loginEmail.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Area selector
  DOM.headerArea.addEventListener('change', (e) => {
    AppState.selectedArea = e.target.value;
    updateDeliveryFeeDisplay();
  });

  // Zone tabs
  DOM.zoneTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      DOM.zoneTabs.forEach((t) => t.classList.remove('active'));
      DOM.zoneContents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const zone = tab.dataset.zone;
      AppState.selectedZone = zone;

      document.getElementById(zone + 'Zone')?.classList.add('active');
    });
  });

  // Delivery option
  document.querySelectorAll('input[name="deliveryOption"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      AppState.deliveryOption = e.target.value;
      updateCartDisplay();
    });
  });

  // Checkout
  DOM.checkoutBtn.addEventListener('click', showPaymentModal);
  DOM.revenueModalBtn.addEventListener('click', () => {
    DOM.cartPanel.classList.remove('active');
    closeAllModals();
    DOM.revenueModal.classList.add('active');
  });

  // Payment options
  DOM.paymentOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const method = btn.dataset.method;
      showConfirmationModal(method);
    });
  });

  // Modal closes
  DOM.modalCloses.forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  DOM.confirmationCloseBtn.addEventListener('click', closeAllModals);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

// ===== INITIALIZE ON LOAD =====
document.addEventListener('DOMContentLoaded', init);

console.log('✅ Tonninyira App Ready - Supabase Backend Integrated');
