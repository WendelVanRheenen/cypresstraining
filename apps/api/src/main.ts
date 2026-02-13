import express from 'express';

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-name, x-admin-password');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  heat: number;
  price: number;
  stock: number;
  imageUrl: string;
  shortDescription: string;
  longDescription: string;
  description?: string;
};

type OrderItem = {
  productId: string;
  qty: number;
};

type Order = {
  id: string;
  accountId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

type PublicOrder = Order & {
  accountName: string;
  accountEmail: string;
};

type State = {
  nextId: number;
  accounts: Account[];
  products: Product[];
  orders: Order[];
};

const seedState = (): State => {
  const accounts: Account[] = [
    {
      id: '1',
      name: 'Chili Lover',
      email: 'chili.lover@example.com',
      password: 'pepper123',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Spice Explorer',
      email: 'spice.explorer@example.com',
      password: 'pepper123',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Heat Seeker',
      email: 'heat.seeker@example.com',
      password: 'pepper123',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'admin',
      email: 'admin@spicy.local',
      password: 'spicelord',
      createdAt: new Date().toISOString(),
    },
  ];

  const products: Product[] = [
    {
      id: '10',
      name: 'Habanero',
      heat: 8,
      price: 4.5,
      stock: 25,
      imageUrl: '/peppers/habanero.jpg',
      shortDescription: 'Fruity heat with a citrus edge.',
      longDescription:
        'The Habanero enters like a polite guest, shakes your hand, and then steals the spotlight. First you get tropical fruit, then suddenly your forehead starts negotiating a peace treaty with your taste buds. Great for salsa, dangerous for ego.',
      description: 'Fruity heat with a citrus edge.',
    },
    {
      id: '11',
      name: 'Ghost Pepper',
      heat: 10,
      price: 6.5,
      stock: 15,
      imageUrl: '/peppers/ghost.jpg',
      shortDescription: 'Smoky and intense. Legendary heat.',
      longDescription:
        "Ghost Pepper does not shout; it whispers, waits, and then launches a full dramatic monologue on your tongue. Smoky, bold, and absolutely not a \"just a little bit\" pepper. Respect it like a boss level in a game you forgot to save.",
      description: 'Smoky and intense. Legendary heat.',
    },
    {
      id: '12',
      name: 'Jalapeno',
      heat: 5,
      price: 3.0,
      stock: 40,
      imageUrl: '/peppers/jalapeno.jpg',
      shortDescription: 'Friendly all-rounder with fresh kick.',
      longDescription:
        'Jalapeno is your reliable teammate: always ready, never dramatic, and somehow still cool under pressure. Slice it on nachos, toss it in burgers, and pretend you are a chili pro while it quietly carries the whole flavor team.',
      description: 'Friendly all-rounder with fresh kick.',
    },
    {
      id: '13',
      name: 'Serrano',
      heat: 6,
      price: 3.5,
      stock: 30,
      imageUrl: '/peppers/serrano.jpg',
      shortDescription: 'Bright heat with a clean finish.',
      longDescription:
        "Serrano is Jalapeno's athletic cousin: slimmer, faster, and just a little extra. Crisp bite, lively heat, and enough attitude to wake up any taco night. If flavor had a sprint race, Serrano would already be at the finish line.",
      description: 'Bright heat with a clean finish.',
    },
    {
      id: '14',
      name: 'Cayenne',
      heat: 7,
      price: 4.0,
      stock: 20,
      imageUrl: '/peppers/cayenne.jpg',
      shortDescription: 'Classic heat for sauces and rubs.',
      longDescription:
        'Cayenne is the veteran chef in pepper form. It has seen every recipe, judged every marinade, and still says, "Needs more spice." Perfect when you want the dish to stand up straight and speak with confidence.',
      description: 'Classic heat for sauces and rubs.',
    },
    {
      id: '15',
      name: 'Scotch Bonnet',
      heat: 9,
      price: 5.0,
      stock: 18,
      imageUrl: '/peppers/scotch-bonnet.jpg',
      shortDescription: 'Sweet tropical taste with serious kick.',
      longDescription:
        'Scotch Bonnet tastes like a sunny holiday and then reminds you that the sun can burn. Sweet, fragrant, and fiery enough to make your dinner table go silent for exactly three seconds before everyone asks for more.',
      description: 'Sweet tropical taste with serious kick.',
    },
  ];

  return {
    nextId: 100,
    accounts,
    products,
    orders: [],
  };
};

let state: State = seedState();

const newId = () => String(state.nextId++);

const findProduct = (id: string) => state.products.find((product) => product.id === id);
const findAccount = (id: string) => state.accounts.find((account) => account.id === id);

const defaultShortDescription = (name: string) => `A bold ${name} pepper with a clean kick.`;
const defaultLongDescription = (name: string, shortDescription: string) =>
  `${name} starts with "${shortDescription}" and ends with happy chaos in the kitchen. A little drama, a lot of flavor, and a very real chance someone at the table asks for water while smiling bravely.`;

const calculateTotal = (items: OrderItem[]) => {
  return items.reduce((total, item) => {
    const product = findProduct(item.productId);
    if (!product) {
      return total;
    }
    return total + product.price * item.qty;
  }, 0);
};

const toPublicOrder = (order: Order): PublicOrder => {
  const account = findAccount(order.accountId);
  return {
    ...order,
    accountName: account?.name ?? 'Unknown account',
    accountEmail: account?.email ?? 'unknown@example.com',
  };
};

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Spicy Pepper Shop API',
    version: '1.0.0',
    description: 'Training API for Cypress exercises',
  },
  servers: [{ url: 'http://localhost:3333' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'API is alive' } },
      },
    },
    '/api/login': {
      post: {
        summary: 'Login with account name and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'password'],
                properties: {
                  name: { type: 'string', example: 'Chili Lover' },
                  password: { type: 'string', example: 'pepper123' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Logged in' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/api/accounts': {
      get: { summary: 'List accounts', responses: { '200': { description: 'List of accounts' } } },
      post: {
        summary: 'Create account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Account created' } },
      },
    },
    '/api/accounts/{id}': {
      delete: {
        summary: 'Delete account',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Account removed' }, '404': { description: 'Account not found' } },
      },
    },
    '/api/products': {
      get: { summary: 'List products', responses: { '200': { description: 'List of products' } } },
      post: {
        summary: 'Create product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'heat', 'price', 'stock'],
                properties: {
                  name: { type: 'string' },
                  heat: { type: 'number' },
                  price: { type: 'number' },
                  stock: { type: 'number' },
                  imageUrl: { type: 'string' },
                  shortDescription: { type: 'string' },
                  longDescription: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Product created' } },
      },
    },
    '/api/products/{id}': {
      put: {
        summary: 'Update product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product updated' }, '404': { description: 'Product not found' } },
      },
      delete: {
        summary: 'Delete product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product removed' }, '404': { description: 'Product not found' } },
      },
    },
    '/api/orders': {
      get: {
        summary: 'List orders',
        description: 'Use accountId to filter per user. Without filter, all orders are returned.',
        parameters: [
          { name: 'accountId', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'List of orders' } },
      },
      post: {
        summary: 'Create order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountId', 'items'],
                properties: {
                  accountId: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['productId', 'qty'],
                      properties: {
                        productId: { type: 'string' },
                        qty: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Order created' } },
      },
    },
    '/api/reset': {
      post: {
        summary: 'Reset all data',
        description: 'Requires admin credentials: name=admin, password=admin.',
        responses: { '200': { description: 'Data reset' }, '401': { description: 'Unauthorized' } },
      },
    },
  },
};

app.get('/api/health', (req, res) => {
  res.send({ status: 'ok' });
});

app.get('/openapi.json', (req, res) => {
  res.send(openApiDocument);
});

app.get('/api-docs', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Spicy Pepper Shop API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
          window.ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui'
          });
        </script>
      </body>
    </html>
  `);
});

app.post('/api/reset', (req, res) => {
  const name = String(req.body?.name ?? req.headers['x-admin-name'] ?? '').trim();
  const password = String(req.body?.password ?? req.headers['x-admin-password'] ?? '').trim();

  if (name.toLowerCase() !== 'admin' || password !== 'admin') {
    res.status(401).send({ error: 'Admin credentials required.' });
    return;
  }

  state = seedState();
  res.send({ status: 'reset', state });
});


app.post('/api/login', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const password = String(req.body?.password || '').trim();

  if (!name || !password) {
    res.status(400).send({ error: 'Name and password are required.' });
    return;
  }

  const account = state.accounts.find(
    (entry) => entry.name.toLowerCase() === name.toLowerCase() && entry.password === password
  );
  if (!account) {
    res.status(401).send({ error: 'Invalid credentials.' });
    return;
  }

  const { password: _pw, ...publicAccount } = account;
  res.send({ account: publicAccount });
});

app.get('/api/accounts', (req, res) => {
  res.send(state.accounts.map(({ password, ...account }) => account));
});

app.post('/api/accounts', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const password = String(req.body?.password || '').trim();

  if (!name || !email || !password) {
    res.status(400).send({ error: 'Name, email, and password are required.' });
    return;
  }

  const account: Account = {
    id: newId(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  state.accounts.push(account);
  const { password: _pw, ...publicAccount } = account;
  res.status(201).send(publicAccount);
});

app.delete('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  const index = state.accounts.findIndex((account) => account.id === id);
  if (index === -1) {
    res.status(404).send({ error: 'Account not found.' });
    return;
  }
  const [removed] = state.accounts.splice(index, 1);
  const { password, ...account } = removed;
  res.send(account);
});

app.get('/api/products', (req, res) => {
  res.send(state.products);
});

app.post('/api/products', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const heat = Number(req.body?.heat);
  const price = Number(req.body?.price);
  const stock = Number(req.body?.stock);
  const imageUrl = String(req.body?.imageUrl || '/peppers/pepper-generic.jpg');
  const shortDescription = String(req.body?.shortDescription || req.body?.description || '').trim();
  const longDescription = String(req.body?.longDescription || '').trim();

  if (!name || !Number.isFinite(heat) || !Number.isFinite(price) || !Number.isFinite(stock)) {
    res.status(400).send({ error: 'Name, heat, price, and stock are required.' });
    return;
  }

  const product: Product = {
    id: newId(),
    name,
    heat,
    price,
    stock,
    imageUrl,
    shortDescription: shortDescription || defaultShortDescription(name),
    longDescription:
      longDescription || defaultLongDescription(name, shortDescription || defaultShortDescription(name)),
    description: shortDescription || defaultShortDescription(name),
  };

  state.products.push(product);
  res.status(201).send(product);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = findProduct(id);
  if (!product) {
    res.status(404).send({ error: 'Product not found.' });
    return;
  }

  const name = String(req.body?.name || '').trim();
  const heat = Number(req.body?.heat);
  const price = Number(req.body?.price);
  const stock = Number(req.body?.stock);
  const imageUrl = String(req.body?.imageUrl || product.imageUrl || '/peppers/pepper-generic.jpg');
  const shortDescription = String(
    req.body?.shortDescription || req.body?.description || product.shortDescription || product.description || ''
  ).trim();
  const longDescription = String(req.body?.longDescription || product.longDescription || '').trim();

  if (!name || !Number.isFinite(heat) || !Number.isFinite(price) || !Number.isFinite(stock)) {
    res.status(400).send({ error: 'Name, heat, price, and stock are required.' });
    return;
  }

  product.name = name;
  product.heat = heat;
  product.price = price;
  product.stock = stock;
  product.imageUrl = imageUrl;
  product.shortDescription = shortDescription || defaultShortDescription(name);
  product.longDescription =
    longDescription || defaultLongDescription(name, shortDescription || defaultShortDescription(name));
  product.description = product.shortDescription;

  res.send(product);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = state.products.findIndex((product) => product.id === id);
  if (index === -1) {
    res.status(404).send({ error: 'Product not found.' });
    return;
  }

  const [removed] = state.products.splice(index, 1);
  res.send(removed);
});

app.get('/api/orders', (req, res) => {
  const accountId = String(req.query?.accountId || '').trim();
  if (accountId) {
    res.send(state.orders.filter((order) => order.accountId === accountId).map(toPublicOrder));
    return;
  }
  res.send(state.orders.map(toPublicOrder));
});

app.post('/api/orders', (req, res) => {
  const accountId = String(req.body?.accountId || '').trim();
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!accountId || items.length === 0) {
    res.status(400).send({ error: 'Account and items are required.' });
    return;
  }

  const account = state.accounts.find((entry) => entry.id === accountId);
  if (!account) {
    res.status(400).send({ error: 'Account not found.' });
    return;
  }

  const normalizedItems: OrderItem[] = [];
  for (const item of items) {
    const productId = String(item?.productId || '').trim();
    const qty = Number(item?.qty);
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).send({ error: 'Invalid order items.' });
      return;
    }
    const product = findProduct(productId);
    if (!product) {
      res.status(400).send({ error: `Product ${productId} not found.` });
      return;
    }
    if (product.stock < qty) {
      res.status(400).send({ error: `Not enough stock for ${product.name}.` });
      return;
    }
    normalizedItems.push({ productId, qty });
  }

  normalizedItems.forEach((item) => {
    const product = findProduct(item.productId);
    if (product) {
      product.stock -= item.qty;
    }
  });

  const order: Order = {
    id: newId(),
    accountId,
    items: normalizedItems,
    total: calculateTotal(normalizedItems),
    createdAt: new Date().toISOString(),
  };

  state.orders.push(order);
  res.status(201).send(toPublicOrder(order));
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}/api`);
});
