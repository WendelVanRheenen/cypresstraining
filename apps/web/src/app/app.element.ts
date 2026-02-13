import './app.element.css';

type Account = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  heat: number;
  price: number;
  stock: number;
  imageUrl: string;
  shortDescription?: string;
  longDescription?: string;
  description?: string;
};

type OrderItem = {
  productId: string;
  qty: number;
};

type Order = {
  id: string;
  accountId: string;
  accountName?: string;
  accountEmail?: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

type CartItem = {
  productId: string;
  qty: number;
};

type Session = {
  id: string;
  name: string;
  email: string;
};

type SessionAuth = {
  name: string;
  password: string;
};

const API_BASE = 'http://localhost:3333/api';
const SESSION_KEY = 'spicy-pepper-user';

export class AppElement extends HTMLElement {
  private accounts: Account[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private cart: CartItem[] = [];
  private editingProductId: string | null = null;
  private session: Session | null = null;
  private sessionAuth: SessionAuth | null = null;
  private currentRoute: 'shop' | 'cart' | 'orders' | 'order' | 'admin' | 'product' | 'login' = 'shop';
  private currentProductId: string | null = null;
  private currentOrderId: string | null = null;
  private isAdmin() {
    return this.session?.name.toLowerCase() === 'admin';
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.initRouting();
    this.restoreSession();
    void this.loadAll();
  }

  private render() {
    this.innerHTML = `
      <div class="app">
        <header>
          <div class="brand">
            <h1 id="app-title">From your local spice lords</h1>
            <p class="small">Multi-page demo for Cypress training. Fresh heat, clean flows.</p>
          </div>
          <nav class="menu" aria-label="Main">
          <a href="#/shop" data-cy="nav-shop">Shop</a>
          <a href="#/cart" data-cy="nav-cart">Cart <span id="cart-count" class="badge">0</span></a>
          <a href="#/orders" data-cy="nav-orders">Orders <span id="order-count" class="badge">0</span></a>
          </nav>
          <span id="status-message" class="notice" style="display:none"></span>
          <div class="actions">
          <span id="session-label" class="badge"></span>
          <button id="login-button" class="ghost">Login</button>
          <button id="logout-button" class="ghost">Logout</button>
          <button id="admin-button" class="ghost">Admin</button>
          </div>
        </header>

        <section id="page-login" data-page="login" class="page">
          <h2>Login</h2>
          <p class="small">Use a seeded account (e.g. Chili Lover / pepper123) or create one in Admin.</p>
          <form id="login-form" class="inline">
            <label for="login-name">Name</label>
            <input id="login-name" placeholder="Chili Lover" />
            <label for="login-password">Password</label>
            <input id="login-password" type="password" placeholder="pepper123" />
            <button id="login-submit" type="submit">Sign in</button>
          </form>
        </section>

        <section id="page-shop" data-page="shop" class="page">
          <h2>Shop</h2>
          <div id="product-list" class="grid" data-cy="product-list"></div>
        </section>

        <section id="page-product" data-page="product" class="page">
          <h2>Product detail</h2>
          <div id="product-detail" class="detail"></div>
        </section>

        <section id="page-cart" data-page="cart" class="page">
          <h2>Cart & Checkout</h2>
          <div class="inline">
            <label>Account</label>
            <span id="cart-account" class="small"></span>
            <button id="place-order-button" class="secondary">Place order</button>
          </div>
          <p id="cart-login-hint" class="notice" style="display:none"></p>
          <div id="cart-items" class="list"></div>
        </section>

        <section id="page-orders" data-page="orders" class="page">
          <h2>Order History</h2>
          <div id="order-list" class="list"></div>
        </section>

        <section id="page-order" data-page="order" class="page">
          <h2>Order Detail</h2>
          <div id="order-detail" class="detail"></div>
        </section>

        <section id="page-admin" data-page="admin" class="page">
          <h2>Admin</h2>
          <div class="inline">
            <button id="reset-button" class="ghost">Reset data</button>
          </div>
          <div class="admin-grid">
            <div>
              <h3>Accounts</h3>
              <form id="account-create-form" class="inline">
                <label for="account-name">Name</label>
                <input id="account-name" placeholder="Pepper fan" />
                <label for="account-email">Email</label>
                <input id="account-email" placeholder="pepper@example.com" />
                <label for="account-password">Password</label>
                <input id="account-password" type="password" placeholder="pepper123" />
                <button id="account-create-button" type="submit">Create</button>
              </form>
              <div id="account-list" class="list" data-cy="account-list"></div>
            </div>

            <div>
              <h3>Products</h3>
              <form id="product-form" class="inline">
                <label for="product-name">Name</label>
                <input id="product-name" />
                <label for="product-heat">Scoville (SHU)</label>
                <input id="product-heat" type="number" min="0" step="100" />
                <label for="product-price">Price</label>
                <input id="product-price" type="number" step="0.1" />
                <label for="product-stock">Stock</label>
                <input id="product-stock" type="number" min="0" />
                <label for="product-description">Description</label>
                <input id="product-description" placeholder="Short text for shop overview" />
                <button id="product-save-button" type="submit">Save</button>
                <button id="product-cancel-button" type="button" class="ghost">Cancel</button>
              </form>
              <table class="table" id="product-admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Scoville (SHU)</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="product-admin-body"></tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    `;
  }

  private bindEvents() {
    this.querySelector('#account-create-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.createAccount();
    });

    this.querySelector('#product-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.saveProduct();
    });

    this.querySelector('#product-cancel-button')?.addEventListener('click', () => {
      this.clearProductForm();
    });

    this.querySelector('#place-order-button')?.addEventListener('click', () => {
      void this.placeOrder();
    });

    this.querySelector('#reset-button')?.addEventListener('click', () => {
      void this.resetData();
    });

    this.querySelector('#login-button')?.addEventListener('click', () => {
      window.location.hash = '#/login';
    });

    this.querySelector('#logout-button')?.addEventListener('click', () => {
      this.logout();
    });

    this.querySelector('#admin-button')?.addEventListener('click', () => {
      window.location.hash = '#/admin';
    });

    this.querySelector('#login-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.login();
    });
  }

  private initRouting() {
    const applyRoute = () => {
      const hash = window.location.hash || '#/shop';
      const [_, route, id] = hash.split('/');

      if (route === 'product' && id) {
        this.currentRoute = 'product';
        this.currentProductId = id;
        this.currentOrderId = null;
      } else if (route === 'orders' && id) {
        this.currentRoute = 'order';
        this.currentOrderId = id;
        this.currentProductId = null;
      } else if (route === 'cart') {
        this.currentRoute = 'cart';
        this.currentProductId = null;
        this.currentOrderId = null;
      } else if (route === 'orders') {
        this.currentRoute = 'orders';
        this.currentProductId = null;
        this.currentOrderId = null;
      } else if (route === 'admin') {
        this.currentRoute = 'admin';
        this.currentProductId = null;
        this.currentOrderId = null;
      } else if (route === 'login') {
        this.currentRoute = 'login';
        this.currentProductId = null;
        this.currentOrderId = null;
      } else {
        this.currentRoute = 'shop';
        this.currentProductId = null;
        this.currentOrderId = null;
      }

      this.updatePageVisibility();
      this.updateMenuActiveState();
      if (this.currentRoute === 'product') {
        this.renderProductDetail();
      }
      if (this.currentRoute === 'order') {
        this.renderOrderDetail();
      }
    };

    window.addEventListener('hashchange', applyRoute);
    applyRoute();
  }

  private updatePageVisibility() {
    const pages = this.querySelectorAll<HTMLElement>('[data-page]');
    pages.forEach((page) => {
      page.classList.toggle('hidden', page.dataset.page !== this.currentRoute);
    });

    const requiresAdmin = ['admin'];
    if (requiresAdmin.includes(this.currentRoute) && !this.isAdmin()) {
      this.setStatus('Admin login required.');
      window.location.hash = '#/login';
    }
  }

  private updateMenuActiveState() {
    const activeMenuCy =
      this.currentRoute === 'cart'
        ? 'nav-cart'
        : this.currentRoute === 'orders' || this.currentRoute === 'order'
          ? 'nav-orders'
          : this.currentRoute === 'shop' || this.currentRoute === 'product'
            ? 'nav-shop'
            : null;

    const links = this.querySelectorAll<HTMLAnchorElement>('.menu a[data-cy]');
    links.forEach((link) => {
      link.classList.toggle('active', activeMenuCy !== null && link.dataset.cy === activeMenuCy);
    });

    const adminButton = this.querySelector('#admin-button') as HTMLButtonElement | null;
    if (adminButton) {
      adminButton.classList.toggle('active-admin', this.currentRoute === 'admin');
    }
  }

  private restoreSession() {
    const stored = window.localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { account?: Session; auth?: SessionAuth } | Session;
        if ('account' in parsed && parsed.account) {
          this.session = parsed.account;
          this.sessionAuth = parsed.auth ?? null;
        } else {
          this.session = parsed as Session;
          this.sessionAuth = null;
        }
      } catch {
        this.session = null;
        this.sessionAuth = null;
      }
    }
    this.updateSessionUI();
  }

  private updateSessionUI() {
    const label = this.querySelector('#session-label') as HTMLElement | null;
    const loginButton = this.querySelector('#login-button') as HTMLButtonElement | null;
    const logoutButton = this.querySelector('#logout-button') as HTMLButtonElement | null;
    const adminButton = this.querySelector('#admin-button') as HTMLButtonElement | null;
    const resetButton = this.querySelector('#reset-button') as HTMLButtonElement | null;
    const placeOrderButton = this.querySelector('#place-order-button') as HTMLButtonElement | null;

    if (!label || !loginButton || !logoutButton) return;

    if (this.session) {
      label.textContent = `Logged in: ${this.session.name}`;
      loginButton.style.display = 'none';
      logoutButton.style.display = 'inline-flex';
    } else {
      label.textContent = 'Not logged in';
      loginButton.style.display = 'inline-flex';
      logoutButton.style.display = 'none';
    }

    if (resetButton) {
      resetButton.style.display = this.isAdmin() ? 'inline-flex' : 'none';
    }

    if (adminButton) {
      adminButton.style.display = this.isAdmin() ? 'inline-flex' : 'none';
    }

    if (placeOrderButton) {
      placeOrderButton.disabled = !this.session;
    }

    const cartAccount = this.querySelector('#cart-account');
    if (cartAccount) {
      cartAccount.textContent = this.session ? this.session.name : 'Guest (login to checkout)';
    }

    const cartHint = this.querySelector('#cart-login-hint') as HTMLElement | null;
    if (cartHint) {
      if (!this.session) {
        cartHint.textContent = 'You can fill your cart as a guest, but you need to log in to checkout.';
        cartHint.style.display = 'block';
      } else {
        cartHint.style.display = 'none';
      }
    }

    this.updateCartCount();
    this.updateOrderCount();
  }

  private async login() {
    const nameInput = this.querySelector('#login-name') as HTMLInputElement | null;
    const passwordInput = this.querySelector('#login-password') as HTMLInputElement | null;
    if (!nameInput || !passwordInput) return;

    const payload = { name: nameInput.value.trim(), password: passwordInput.value.trim() };
    if (!payload.name || !payload.password) {
      this.setStatus('Enter name and password.');
      return;
    }

    try {
      const response = await this.request<{ account: Session }>('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.session = response.account;
      this.sessionAuth = { name: payload.name, password: payload.password };
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ account: this.session, auth: this.sessionAuth })
      );
      this.setStatus('Logged in.');
      this.updateSessionUI();
      await this.loadOrders();
      window.location.hash = '#/shop';
    } catch (error) {
      this.setStatus('Login failed.');
    }
  }

  private logout() {
    this.session = null;
    this.sessionAuth = null;
    window.localStorage.removeItem(SESSION_KEY);
    this.orders = [];
    this.updateSessionUI();
    this.renderOrders();
    this.renderOrderDetail();
    this.setStatus('Logged out.');
    window.location.hash = '#/shop';
  }

  private async loadAll() {
    await Promise.all([this.loadAccounts(), this.loadProducts(), this.loadOrders()]);
    this.renderCart();
    this.renderOrders();
    this.renderOrderDetail();
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  private setStatus(message: string) {
    const el = this.querySelector('#status-message') as HTMLElement | null;
    if (!el) {
      return;
    }
    el.textContent = message;
    el.style.display = 'inline-flex';
    el.classList.remove('toast');
    void el.offsetWidth;
    el.classList.add('toast');
    setTimeout(() => {
      el.style.display = 'none';
    }, 3000);
  }

  private async loadAccounts() {
    this.accounts = await this.request<Account[]>('/accounts');
    this.renderAccounts();
  }

  private renderAccounts() {
    const list = this.querySelector('#account-list');
    if (!list) return;

    list.innerHTML = this.accounts
      .map(
        (account) => `
        <div class="card" id="account-${account.id}">
          <strong>${account.name}</strong>
          <span class="small">${account.email}</span>
          <span class="small">Created: ${new Date(account.createdAt).toLocaleString()}</span>
          <button class="ghost" data-account-id="${account.id}">Delete</button>
        </div>
      `
      )
      .join('');

    list.querySelectorAll('button[data-account-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = (button as HTMLElement).dataset.accountId || '';
        void this.deleteAccount(id);
      });
    });
  }

  private async createAccount() {
    const nameInput = this.querySelector('#account-name') as HTMLInputElement | null;
    const emailInput = this.querySelector('#account-email') as HTMLInputElement | null;
    const passwordInput = this.querySelector('#account-password') as HTMLInputElement | null;
    if (!nameInput || !emailInput || !passwordInput) return;

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
    };

    if (!payload.name || !payload.email || !payload.password) {
      this.setStatus('Enter name, email, and password.');
      return;
    }

    await this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    await this.loadAccounts();
    this.setStatus('Account created.');
  }

  private async deleteAccount(id: string) {
    if (!id) return;
    await this.request<Account>(`/accounts/${id}`, { method: 'DELETE' });
    await this.loadAccounts();
    this.setStatus('Account deleted.');
  }

  private async loadProducts() {
    this.products = await this.request<Product[]>('/products');
    this.renderProducts();
    this.renderProductAdmin();
    if (this.currentRoute === 'product') {
      this.renderProductDetail();
    }
  }

  private renderProducts() {
    const list = this.querySelector('#product-list');
    if (!list) return;

    list.innerHTML = this.products
      .map(
        (product) => `
        <div class="card" id="product-${product.id}">
          <img class="pepper-image" src="${product.imageUrl || '/peppers/pepper-generic.jpg'}" alt="${product.name}" />
          <div class="inline">
            <strong>${product.name}</strong>
            <span class="badge">${this.formatShu(product.heat)} SHU</span>
          </div>
          <span class="small">Price: €${product.price.toFixed(2)}</span>
          <span class="small">Stock: ${product.stock}</span>
          <p class="small">${product.shortDescription || product.description || 'A pepper with personality.'}</p>
          <div class="inline">
            <button data-product-id="${product.id}">Add to cart</button>
            <a class="link" href="#/product/${product.id}">Details</a>
          </div>
        </div>
      `
      )
      .join('');

    list.querySelectorAll('button[data-product-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = (button as HTMLElement).dataset.productId || '';
        this.addToCart(id);
      });
    });
  }

  private renderProductAdmin() {
    const tbody = this.querySelector('#product-admin-body');
    if (!tbody) return;

    tbody.innerHTML = this.products
      .map(
        (product) => `
        <tr id="admin-product-${product.id}">
          <td>${product.name}</td>
          <td>${this.formatShu(product.heat)}</td>
          <td>€${product.price.toFixed(2)}</td>
          <td>${product.stock}</td>
          <td>
            <button class="ghost" data-edit-id="${product.id}">Edit</button>
            <button class="secondary" data-delete-id="${product.id}">Delete</button>
          </td>
        </tr>
      `
      )
      .join('');

    tbody.querySelectorAll('button[data-edit-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = (button as HTMLElement).dataset.editId || '';
        this.fillProductForm(id);
      });
    });

    tbody.querySelectorAll('button[data-delete-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = (button as HTMLElement).dataset.deleteId || '';
        void this.deleteProduct(id);
      });
    });
  }

  private fillProductForm(id: string) {
    const product = this.products.find((item) => item.id === id);
    if (!product) return;

    (this.querySelector('#product-name') as HTMLInputElement).value = product.name;
    (this.querySelector('#product-heat') as HTMLInputElement).value = String(product.heat);
    (this.querySelector('#product-price') as HTMLInputElement).value = String(product.price);
    (this.querySelector('#product-stock') as HTMLInputElement).value = String(product.stock);
    (this.querySelector('#product-description') as HTMLInputElement).value =
      product.shortDescription || product.description || '';
    this.editingProductId = product.id;
    this.setStatus('Editing product.');
  }

  private clearProductForm() {
    (this.querySelector('#product-name') as HTMLInputElement).value = '';
    (this.querySelector('#product-heat') as HTMLInputElement).value = '';
    (this.querySelector('#product-price') as HTMLInputElement).value = '';
    (this.querySelector('#product-stock') as HTMLInputElement).value = '';
    (this.querySelector('#product-description') as HTMLInputElement).value = '';
    this.editingProductId = null;
  }

  private async saveProduct() {
    const name = (this.querySelector('#product-name') as HTMLInputElement).value.trim();
    const heat = Number((this.querySelector('#product-heat') as HTMLInputElement).value);
    const price = Number((this.querySelector('#product-price') as HTMLInputElement).value);
    const stock = Number((this.querySelector('#product-stock') as HTMLInputElement).value);
    const shortDescription = (this.querySelector('#product-description') as HTMLInputElement).value.trim();

    if (!name || !Number.isFinite(heat) || !Number.isFinite(price) || !Number.isFinite(stock)) {
      this.setStatus('Fill out name, Scoville (SHU), price, stock.');
      return;
    }

    const payload = { name, heat, price, stock, shortDescription };

    if (this.editingProductId) {
      await this.request(`/products/${this.editingProductId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      this.setStatus('Product updated.');
    } else {
      await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setStatus('Product created.');
    }

    this.clearProductForm();
    await this.loadProducts();
  }

  private async deleteProduct(id: string) {
    if (!id) return;
    await this.request(`/products/${id}`, { method: 'DELETE' });
    await this.loadProducts();
    this.setStatus('Product deleted.');
  }

  private addToCart(productId: string) {
    const existing = this.cart.find((item) => item.productId === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({ productId, qty: 1 });
    }
    this.renderCart();
    const product = this.products.find((item) => item.id === productId);
    this.setStatus(product ? `${product.name} added to cart.` : 'Added to cart.');
  }

  private renderCart() {
    const container = this.querySelector('#cart-items');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = '<p class="small">Cart is empty.</p>';
      this.updateCartCount();
      return;
    }

    container.innerHTML = this.cart
      .map((item) => {
        const product = this.products.find((entry) => entry.id === item.productId);
        return `
          <div class="card">
            <strong>${product?.name ?? 'Unknown pepper'}</strong>
            <span class="small">Qty: ${item.qty}</span>
            <span class="small">Subtotal: €${((product?.price ?? 0) * item.qty).toFixed(2)}</span>
          </div>
        `;
      })
      .join('');

    this.updateCartCount();
  }

  private async placeOrder() {
    if (!this.session) {
      this.setStatus('Please log in to place an order.');
      window.location.hash = '#/login';
      return;
    }

    if (this.cart.length === 0) {
      this.setStatus('Cart is empty.');
      return;
    }

    const payload = {
      accountId: this.session.id,
      items: this.cart.map((item) => ({ productId: item.productId, qty: item.qty })),
    };

    await this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    this.cart = [];
    await Promise.all([this.loadOrders(), this.loadProducts()]);
    this.renderCart();
    this.setStatus('Order placed.');
    window.location.hash = '#/cart';
  }

  private async loadOrders() {
    if (!this.session) {
      this.orders = [];
      this.renderOrders();
      this.renderOrderDetail();
      return;
    }
    const query = this.isAdmin() ? '' : `?accountId=${encodeURIComponent(this.session.id)}`;
    this.orders = await this.request<Order[]>(`/orders${query}`);
    this.renderOrders();
    if (this.currentRoute === 'order') {
      this.renderOrderDetail();
    }
  }

  private renderOrders() {
    const list = this.querySelector('#order-list');
    if (!list) return;

    if (!this.session) {
      list.innerHTML = '<p class="small">Log in to view your order history.</p>';
      this.updateOrderCount();
      return;
    }

    if (this.orders.length === 0) {
      list.innerHTML = '<p class="small">No orders yet.</p>';
      this.updateOrderCount();
      return;
    }

    list.innerHTML = this.orders
      .map((order) => {
        const itemCount = order.items.reduce((total, item) => total + item.qty, 0);
        const ownerName =
          order.accountName ||
          this.accounts.find((entry) => entry.id === order.accountId)?.name ||
          'Unknown account';
        return `
        <div class="card" id="order-${order.id}">
          <a class="link" href="#/orders/${order.id}"><strong>Order ${order.id}</strong></a>
          ${this.isAdmin() ? `<span class="small">Account: ${ownerName}</span>` : ''}
          <span class="small">Items: ${itemCount}</span>
          <span class="small">Total: €${order.total.toFixed(2)}</span>
          <span class="small">Created: ${new Date(order.createdAt).toLocaleString()}</span>
        </div>
      `;
      })
      .join('');

    this.updateOrderCount();
  }

  private renderOrderDetail() {
    const container = this.querySelector('#order-detail');
    if (!container) return;

    if (!this.session) {
      container.innerHTML = '<p class="small">Log in to view order details.</p>';
      return;
    }

    const order = this.orders.find((item) => item.id === this.currentOrderId);
    if (!order) {
      container.innerHTML = `
        <p class="small">Order not found.</p>
        <a class="link" href="#/orders">Back to orders</a>
      `;
      return;
    }

    const ownerName =
      order.accountName ||
      this.accounts.find((entry) => entry.id === order.accountId)?.name ||
      'Unknown account';
    const ownerEmail =
      order.accountEmail ||
      this.accounts.find((entry) => entry.id === order.accountId)?.email ||
      'unknown@example.com';

    const itemRows = order.items
      .map((item) => {
        const product = this.products.find((entry) => entry.id === item.productId);
        const name = product?.name ?? 'Unknown pepper';
        const price = product?.price ?? 0;
        return `
              <div class="detail-card">
            <img class="pepper-image" src="${product?.imageUrl || '/peppers/pepper-generic.jpg'}" alt="${product?.name}" />
            <div class="detail-content">
            <strong>${name}</strong>
            <span class="small">Qty: ${item.qty}</span>
            <span class="small">Line total: €${(price * item.qty).toFixed(2)}</span>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="detail-card">
        <div class="detail-content">
          <h3>Order ${order.id}</h3>
          ${this.isAdmin() ? `<p class="small">Account: ${ownerName} (${ownerEmail})</p>` : ''}
          <p class="small">Placed: ${new Date(order.createdAt).toLocaleString()}</p>
          <p class="small">Total: €${order.total.toFixed(2)}</p>
          <a class="link" href="#/orders">Back to orders</a>
        </div>
      </div>
      <div class="list">${itemRows}</div>
    `;
  }

  private renderProductDetail() {
    const container = this.querySelector('#product-detail');
    if (!container) return;

    const product = this.products.find((item) => item.id === this.currentProductId);
    if (!product) {
      container.innerHTML = '<p class="small">Product not found.</p>';
      return;
    }

    container.innerHTML = `
      <div class="detail-card">
        <img class="pepper-image" src="${product.imageUrl || '/peppers/pepper-generic.jpg'}" alt="${product.name}" />
        <div class="detail-content">
          <h3>${product.name}</h3>
          <p class="small">Scoville: ${this.formatShu(product.heat)} SHU</p>
          <p class="small">Price: €${product.price.toFixed(2)}</p>
          <p class="small">Stock: ${product.stock}</p>
          <p class="small"><strong>Quick take:</strong> ${product.shortDescription || product.description || 'A bold pepper with a clean kick.'}</p>
          <p class="small">${
            product.longDescription ||
            `Once upon a dinner plan, ${product.name} walked in like it owned the kitchen. Everyone said, "Just one bite." Five minutes later there were dramatic faces, proud tears, and someone claiming they "totally meant" to drink a full glass of milk.`
          }</p>
          <div class="inline">
            <button data-product-id="${product.id}">Add to cart</button>
            <a class="link" href="#/shop">Back to shop</a>
          </div>
        </div>
      </div>
    `;

    const addButton = container.querySelector('button[data-product-id]');
    addButton?.addEventListener('click', () => {
      this.addToCart(product.id);
    });
  }

  private async resetData() {
    if (!this.session || this.session.name.toLowerCase() !== 'admin') {
      this.setStatus('Admin login required to reset.');
      return;
    }

    const creds = { name: 'admin', password: 'admin' };
    await this.request('/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-name': creds.name,
        'x-admin-password': creds.password,
      },
      body: JSON.stringify({
        name: creds.name,
        password: creds.password,
      }),
    });
    this.cart = [];
    await this.loadAll();
    this.updateCartCount();
    this.setStatus('Data reset.');
  }

  private updateCartCount() {
    const countEl = this.querySelector('#cart-count') as HTMLElement | null;
    if (!countEl) return;
    const count = this.cart.reduce((total, item) => total + item.qty, 0);
    countEl.textContent = String(count);
    countEl.style.display = 'inline-flex';
  }

  private updateOrderCount() {
    const countEl = this.querySelector('#order-count') as HTMLElement | null;
    if (!countEl) return;
    countEl.textContent = String(this.orders.length);
    countEl.style.display = 'inline-flex';
  }

  private formatShu(value: number) {
    return new Intl.NumberFormat('nl-NL').format(value);
  }
}

customElements.define('spicy-pepper-shop-root', AppElement);
