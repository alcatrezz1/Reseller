// ── Cart state ──
const cart = [];

function formatPrice(n) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function renderCart() {
  const items = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const badge = document.getElementById('cartBadge');
  const total = document.getElementById('cartTotal');

  badge.textContent = cart.length;
  badge.style.display = cart.length === 0 ? 'none' : 'flex';

  if (cart.length === 0) {
    empty.style.display = 'flex';
    footer.style.display = 'none';
    // Remove all cart-line elements
    items.querySelectorAll('.cart-line').forEach(el => el.remove());
    return;
  }

  empty.style.display = 'none';
  footer.style.display = 'flex';

  // Rebuild lines
  items.querySelectorAll('.cart-line').forEach(el => el.remove());
  cart.forEach((item, idx) => {
    const line = document.createElement('div');
    line.className = 'cart-line';
    line.innerHTML = `
      <span class="cart-line-name">${item.name}</span>
      <span class="cart-line-price">${formatPrice(item.price)}</span>
      <button class="cart-line-remove" onclick="removeFromCart(${idx})" title="Удалить">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    items.appendChild(line);
  });

  const sum = cart.reduce((acc, i) => acc + i.price, 0);
  total.textContent = formatPrice(sum);
}

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
  openCart();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}

// ── Cart open/close ──
function openCart() {
  document.getElementById('cartSidebar').classList.add('active');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = sidebar.classList.contains('active');
  if (isOpen) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    openCart();
  }
}

document.getElementById('cartBtn').addEventListener('click', toggleCart);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('searchDropdown').classList.remove('active');
  }
});

// ── Search ──
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const searchDropdown = document.getElementById('searchDropdown');

const catalog = [
  { name: 'iPhone 17', brand: 'Apple', specs: 'A19 · 6.1" Super Retina · 48 Мп', color1: '#007AFF', color2: '#5AC8FA', price: 100000 },
  { name: 'iPhone 17 Pro', brand: 'Apple', specs: 'A19 Pro · 6.3" ProMotion · Titanium', color1: '#5856D6', color2: '#AF52DE', price: 100000 },
  { name: 'Samsung Galaxy S25', brand: 'Samsung', specs: 'Snapdragon 8 Elite · 6.2" AMOLED · 50 Мп', color1: '#1428A0', color2: '#4F6BED', price: 100000 },
  { name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', specs: 'Snapdragon 8 Elite · 6.9" LTPO · 200 Мп · S Pen', color1: '#E63946', color2: '#FF6B6B', price: 100000 },
];

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchClear.style.display = q ? 'flex' : 'none';

  if (!q) {
    searchDropdown.classList.remove('active');
    return;
  }

  const matches = catalog.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  );

  if (!matches.length) {
    searchDropdown.classList.remove('active');
    return;
  }

  searchDropdown.innerHTML = matches.map(p => `
    <div class="sdrop-item" onclick="scrollToCatalog()">
      <div class="sdrop-item-icon" style="background:linear-gradient(135deg,${p.color1},${p.color2})">
        <svg viewBox="0 0 24 24" fill="white"><rect x="5" y="2" width="14" height="20" rx="3"/></svg>
      </div>
      <div>
        <strong>${p.name}</strong>
        <span>${p.specs} — ${p.price.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  `).join('');
  searchDropdown.classList.add('active');
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  searchDropdown.classList.remove('active');
  searchInput.focus();
});

function scrollToCatalog() {
  const catalogEl = document.getElementById('catalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = 'catalog.html';
  }
  searchDropdown.classList.remove('active');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar') && !e.target.closest('.search-dropdown')) {
    searchDropdown.classList.remove('active');
  }
});

// ── Color dot switcher ──
document.querySelectorAll('.product-colors').forEach(group => {
  group.querySelectorAll('.cdot').forEach(dot => {
    dot.addEventListener('click', () => {
      group.querySelectorAll('.cdot').forEach(d => d.removeAttribute('data-active'));
      dot.setAttribute('data-active', 'true');
    });
  });
});

// ── Scroll reveal ──
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 60}ms`;
  observer.observe(el);
});

// ── Brand nav touch scroll ──
const brandnav = document.getElementById('brandNav');
if (brandnav) {
  let isDown = false, startX, scrollLeft;
  brandnav.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - brandnav.offsetLeft;
    scrollLeft = brandnav.scrollLeft;
  });
  brandnav.addEventListener('mouseleave', () => isDown = false);
  brandnav.addEventListener('mouseup', () => isDown = false);
  brandnav.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - brandnav.offsetLeft;
    brandnav.scrollLeft = scrollLeft - (x - startX);
  });
}

// ── Brand filter ──
function filterBrand(brand) {
  if (!document.getElementById('productsGrid')) {
    window.location.href = 'catalog.html';
    return;
  }
  const cards = document.querySelectorAll('#productsGrid .product-card');
  let visible = 0;
  cards.forEach(card => {
    const show = card.dataset.brand === brand;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const emptyEl = document.getElementById('catalogEmpty');
  if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  document.querySelectorAll('.brand-link').forEach(link => {
    link.classList.toggle('brand-active', link.dataset.brand === brand);
  });
  const catalogEl = document.getElementById('catalog');
  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
}

function showAllBrands() {
  if (!document.getElementById('productsGrid')) return;
  document.querySelectorAll('#productsGrid .product-card').forEach(card => {
    card.style.display = '';
  });
  const emptyEl = document.getElementById('catalogEmpty');
  if (emptyEl) emptyEl.style.display = 'none';
  document.querySelectorAll('.brand-link').forEach(link => link.classList.remove('brand-active'));
  const catalogEl = document.getElementById('catalog');
  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
}

// ── Auth ──
const ADMIN_CREDS = { username: 'admin', password: 'reseller2025' };

function getAuth() { try { return JSON.parse(localStorage.getItem('rs_auth')); } catch { return null; } }
function setAuth(d) { localStorage.setItem('rs_auth', JSON.stringify(d)); }
function clearAuth() { localStorage.removeItem('rs_auth'); }
function isAdmin() { const a = getAuth(); return a && a.role === 'admin'; }

function updateAuthUI() {
  const btn = document.getElementById('loginBtn');
  const addBtn = document.getElementById('addProductBtn');
  if (isAdmin()) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg><span>Администратор</span>`;
    btn.classList.add('admin-mode');
    btn.title = 'Нажмите для выхода';
    if (addBtn) addBtn.style.display = 'inline-flex';
    document.body.classList.add('admin-logged');
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg><span>Войти</span>`;
    btn.classList.remove('admin-mode');
    btn.title = '';
    if (addBtn) addBtn.style.display = 'none';
    document.body.classList.remove('admin-logged');
  }
}

// ── Login modal ──
function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
  setTimeout(() => document.getElementById('loginUsername').focus(), 50);
  document.body.style.overflow = 'hidden';
}
function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  document.body.style.overflow = '';
}

document.getElementById('loginBtn').addEventListener('click', () => {
  if (isAdmin()) { clearAuth(); updateAuthUI(); } else { openLoginModal(); }
});
document.getElementById('loginModal').addEventListener('click', e => {
  if (e.target === document.getElementById('loginModal')) closeLoginModal();
});
document.getElementById('loginSubmit').addEventListener('click', attemptLogin);
document.getElementById('loginPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptLogin();
});

function attemptLogin() {
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
    setAuth({ role: 'admin' });
    closeLoginModal();
    updateAuthUI();
  } else {
    document.getElementById('loginError').textContent = 'Неверный логин или пароль';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
}

// ── Add product modal ──
const PRODUCT_TYPES = {
  apple: ['iPhone', 'iPad', 'MacBook', 'Apple Watch', 'AirPods', 'Mac'],
  samsung: ['Galaxy S', 'Galaxy A', 'Galaxy Tab', 'Galaxy Watch', 'Galaxy Buds'],
  dyson: ['Пылесос', 'Фен Supersonic', 'Стайлер Airwrap', 'Очиститель воздуха', 'Вентилятор'],
  playstation: ['PlayStation 5', 'Геймпад DualSense', 'Аксессуары', 'Игры'],
  honor: ['Смартфон', 'Планшет', 'Ноутбук', 'Смарт-часы'],
  xiaomi: ['Смартфон', 'Redmi', 'POCO', 'Смарт-часы', 'Аксессуары'],
  oneplus: ['Флагманский смартфон', 'OnePlus Nord', 'Смарт-часы'],
  google: ['Pixel 9', 'Pixel 9 Pro', 'Pixel Watch', 'Pixel Buds'],
};
const BRAND_COLORS = {
  apple: ['#007AFF','#5AC8FA'], samsung: ['#1428A0','#4F6BED'],
  dyson: ['#C5A96D','#A08040'], playstation: ['#003087','#4F6BED'],
  honor: ['#CF0000','#FF4040'], xiaomi: ['#FF6900','#FFAA00'],
  oneplus: ['#F5010C','#FF6060'], google: ['#4285F4','#34A853'],
};
const BRAND_NAMES = {
  apple:'Apple', samsung:'Samsung', dyson:'Dyson', playstation:'PlayStation',
  honor:'Honor', xiaomi:'Xiaomi', oneplus:'OnePlus', google:'Google',
};

let apPhotoBase64 = null;

function updateProductTypes() {
  const brand = document.getElementById('apBrand').value;
  const sel = document.getElementById('apType');
  sel.innerHTML = '<option value="">Выберите тип</option>';
  (PRODUCT_TYPES[brand] || []).forEach(t => {
    const o = document.createElement('option');
    o.value = o.textContent = t;
    sel.appendChild(o);
  });
}

const _apPhotoEl = document.getElementById('apPhoto');
if (_apPhotoEl) _apPhotoEl.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    apPhotoBase64 = e.target.result;
    const preview = document.getElementById('apPhotoPreview');
    preview.src = apPhotoBase64;
    preview.style.display = 'block';
    document.getElementById('fileUploadUI').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

function openAddProductModal() {
  if (!isAdmin()) return;
  document.getElementById('addProductModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeAddProductModal() {
  document.getElementById('addProductModal').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('apBrand').value = '';
  document.getElementById('apType').innerHTML = '<option value="">Сначала выберите бренд</option>';
  document.getElementById('apName').value = '';
  document.getElementById('apDesc').value = '';
  document.getElementById('apSpecs').value = '';
  document.getElementById('apPrice').value = '';
  document.getElementById('apPhoto').value = '';
  apPhotoBase64 = null;
  document.getElementById('apPhotoPreview').style.display = 'none';
  document.getElementById('fileUploadUI').style.display = 'flex';
}
const _addModalEl = document.getElementById('addProductModal');
if (_addModalEl) _addModalEl.addEventListener('click', e => {
  if (e.target === _addModalEl) closeAddProductModal();
});

function escapeHTML(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function submitAddProduct() {
  const brand = document.getElementById('apBrand').value;
  const type  = document.getElementById('apType').value;
  const name  = document.getElementById('apName').value.trim();
  const desc  = document.getElementById('apDesc').value.trim();
  const specs = document.getElementById('apSpecs').value.trim();
  const price = parseInt(document.getElementById('apPrice').value) || 0;
  if (!brand || !name || !price) {
    alert('Заполните обязательные поля: Бренд, Название товара, Цена');
    return;
  }
  const product = { id: Date.now(), brand, type, name, desc, specs, price, photo: apPhotoBase64 };
  try {
    const arr = getCustomProducts();
    arr.push(product);
    saveCustomProducts(arr);
  } catch {
    alert('Не удалось сохранить: фото слишком большое. Уменьшите размер изображения.');
    return;
  }
  renderCustomProduct(product);
  closeAddProductModal();
}

function getCustomProducts() { try { return JSON.parse(localStorage.getItem('rs_products')) || []; } catch { return []; } }
function saveCustomProducts(arr) { localStorage.setItem('rs_products', JSON.stringify(arr)); }

function renderCustomProduct(product) {
  const colors = BRAND_COLORS[product.brand] || ['#636366','#8E8E93'];
  const brandLabel = escapeHTML(BRAND_NAMES[product.brand] || product.brand);
  const typeBadge = product.type
    ? `<div class="product-badge badge-new" style="font-size:10px;text-transform:none;">${escapeHTML(product.type)}</div>`
    : '';
  const photoHTML = product.photo
    ? `<img src="${product.photo}" style="width:100%;height:160px;object-fit:cover;border-radius:12px;display:block;" alt="${escapeHTML(product.name)}"/>`
    : `<div style="width:100%;height:160px;background:linear-gradient(145deg,${colors[0]},${colors[1]});border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:900;color:rgba(255,255,255,0.22);">${brandLabel.charAt(0)}</div>`;

  const card = document.createElement('div');
  card.className = 'product-card glass';
  card.dataset.brand = product.brand;
  card.dataset.productId = product.id;
  card.innerHTML = `
    ${typeBadge}
    <button class="product-admin-delete" title="Удалить товар">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="product-visual" style="padding:16px;">
      ${photoHTML}
    </div>
    <div class="product-info">
      <div class="product-brand">${brandLabel}</div>
      <h3 class="product-name">${escapeHTML(product.name)}</h3>
      ${product.specs ? `<p class="product-specs">${escapeHTML(product.specs)}</p>` : ''}
      ${product.desc  ? `<p style="font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:10px;">${escapeHTML(product.desc)}</p>` : ''}
      <div class="product-bottom" style="margin-top:auto;">
        <div class="product-price">${product.price.toLocaleString('ru-RU')} <span>₽</span></div>
        <button class="buy-btn">В корзину</button>
      </div>
    </div>`;

  card.querySelector('.buy-btn').addEventListener('click', () => addToCart(product.name, product.price));
  card.querySelector('.product-admin-delete').addEventListener('click', () => deleteCustomProduct(product.id));

  document.getElementById('productsGrid').appendChild(card);
}

function deleteCustomProduct(id) {
  if (!isAdmin() || !confirm('Удалить этот товар?')) return;
  const card = document.querySelector(`[data-product-id="${id}"]`);
  if (card) card.remove();
  saveCustomProducts(getCustomProducts().filter(p => p.id !== id));
}

function loadCustomProducts() {
  if (!document.getElementById('productsGrid')) return;
  getCustomProducts().forEach(renderCustomProduct);
}

// ── Banner Slider ──
const sliderTrack = document.getElementById('sliderTrack');
if (sliderTrack) {
  const slides = sliderTrack.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('sliderDots');
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
  let current = 0;
  let autoTimer;

  function goToSlide(n) {
    current = ((n % slides.length) + slides.length) % slides.length;
    sliderTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToSlide(current + 1), 5000);
  }

  document.getElementById('sliderPrev').addEventListener('click', () => { goToSlide(current - 1); startAuto(); });
  document.getElementById('sliderNext').addEventListener('click', () => { goToSlide(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAuto(); }));

  // Touch / swipe support
  let touchStartX = 0;
  sliderTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  sliderTrack.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goToSlide(diff > 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
}

// ── Init ──
renderCart();
updateAuthUI();
loadCustomProducts();
