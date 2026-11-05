import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

interface LedgerData {
  bookId: string;
  lastModified: number;
  transactions: any[];
  categories: any[];
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'ledgers.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache backed by JSON file
let ledgersCache: Record<string, LedgerData> = {};

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    ledgersCache = JSON.parse(raw);
  }
} catch (err) {
  console.error('Error reading ledgers file, initializing empty cache:', err);
  ledgersCache = {};
}

function persistLedgers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(ledgersCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting ledgers to disk:', err);
  }
}

app.use(express.json({ limit: '10mb' }));

// Listeners for long-polling / instant updates
const activePollers: Record<string, Array<{ res: Response; since: number }>> = {};

function notifyPollers(bookId: string, updatedData: LedgerData) {
  const pollers = activePollers[bookId];
  if (pollers && pollers.length > 0) {
    while (pollers.length > 0) {
      const p = pollers.pop();
      if (p && !p.res.writableEnded) {
        p.res.json({
          modified: true,
          lastModified: updatedData.lastModified,
          transactions: updatedData.transactions,
          categories: updatedData.categories,
        });
      }
    }
  }
}

// Default initial categories
const DEFAULT_CATEGORIES = [
  { id: 'exp-1', name: 'Makan & Minum', type: 'expense', color: '#f97316' },
  { id: 'exp-2', name: 'Belanja Harian & Sayur', type: 'expense', color: '#10b981' },
  { id: 'exp-3', name: 'Listrik, Air & WiFi', type: 'expense', color: '#06b6d4' },
  { id: 'exp-4', name: 'Transportasi & Bensin', type: 'expense', color: '#3b82f6' },
  { id: 'exp-5', name: 'Kesehatan & Obat', type: 'expense', color: '#ef4444' },
  { id: 'exp-6', name: 'Pendidikan & Kursus', type: 'expense', color: '#8b5cf6' },
  { id: 'exp-7', name: 'Hiburan & Rekreasi', type: 'expense', color: '#ec4899' },
  { id: 'exp-8', name: 'Cicilan & Tagihan', type: 'expense', color: '#64748b' },
  { id: 'exp-9', name: 'Zakat, Infaq & Sosial', type: 'expense', color: '#14b8a6' },
  { id: 'exp-10', name: 'Kebutuhan Rumah Tangga', type: 'expense', color: '#d97706' },
  { id: 'exp-11', name: 'Pengeluaran Lainnya', type: 'expense', color: '#94a3b8' },
  { id: 'inc-1', name: 'Gaji Bulanan', type: 'income', color: '#059669' },
  { id: 'inc-2', name: 'Bonus & THR', type: 'income', color: '#10b981' },
  { id: 'inc-3', name: 'Bisnis & Jualan', type: 'income', color: '#0284c7' },
  { id: 'inc-4', name: 'Freelance & Sampingan', type: 'income', color: '#7c3aed' },
  { id: 'inc-5', name: 'Investasi & Dividen', type: 'income', color: '#0d9488' },
  { id: 'inc-6', name: 'Transfer & Hadiah', type: 'income', color: '#d946ef' },
  { id: 'inc-7', name: 'Pemasukan Lainnya', type: 'income', color: '#64748b' },
];

function getOrCreateLedger(bookId: string): LedgerData {
  const normalizedId = (bookId || 'utama').trim().toLowerCase();
  if (!ledgersCache[normalizedId]) {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    ledgersCache[normalizedId] = {
      bookId: normalizedId,
      lastModified: Date.now(),
      categories: DEFAULT_CATEGORIES,
      transactions: [
        {
          id: 'tx-seed-1',
          date: `${ym}-01`,
          type: 'income',
          categoryId: 'inc-1',
          categoryName: 'Gaji Bulanan',
          amount: 8500000,
          wallet: 'BCA',
          notes: 'Gaji bulanan kantor utama',
          createdAt: Date.now() - 500000,
        },
        {
          id: 'tx-seed-2',
          date: `${ym}-02`,
          type: 'expense',
          categoryId: 'exp-3',
          categoryName: 'Listrik, Air & WiFi',
          amount: 450000,
          wallet: 'BCA',
          notes: 'Token listrik PLN & langganan WiFi Indihome',
          createdAt: Date.now() - 480000,
        },
        {
          id: 'tx-seed-3',
          date: `${ym}-03`,
          type: 'expense',
          categoryId: 'exp-8',
          categoryName: 'Cicilan & Tagihan',
          amount: 1500000,
          wallet: 'BCA',
          notes: 'Cicilan bulanan rumah / KPR',
          createdAt: Date.now() - 450000,
        },
        {
          id: 'tx-seed-4',
          date: `${ym}-04`,
          type: 'expense',
          categoryId: 'exp-2',
          categoryName: 'Belanja Harian & Sayur',
          amount: 320000,
          wallet: 'Tunai / Kas Fisik',
          notes: 'Belanja sayur segar & lauk pauk mingguan',
          createdAt: Date.now() - 420000,
        },
        {
          id: 'tx-seed-5',
          date: `${ym}-05`,
          type: 'expense',
          categoryId: 'exp-1',
          categoryName: 'Makan & Minum',
          amount: 85000,
          wallet: 'Tunai / Kas Fisik',
          notes: 'Makan siang warteg bersama keluarga',
          createdAt: Date.now() - 300000,
        },
      ],
    };
    persistLedgers();
  }
  return ledgersCache[normalizedId];
}

// 1. GET /api/ledger/:bookId - Fetch complete ledger data
app.get('/api/ledger/:bookId', (req: Request, res: Response) => {
  const ledger = getOrCreateLedger(req.params.bookId);
  res.json({
    success: true,
    bookId: ledger.bookId,
    lastModified: ledger.lastModified,
    transactions: ledger.transactions,
    categories: ledger.categories,
  });
});

// 2. POST /api/ledger/:bookId - Full sync/update of ledger
app.post('/api/ledger/:bookId', (req: Request, res: Response) => {
  const bookId = (req.params.bookId || 'utama').trim().toLowerCase();
  const { transactions, categories } = req.body;

  if (!Array.isArray(transactions) || !Array.isArray(categories)) {
    res.status(400).json({ success: false, error: 'Invalid data format' });
    return;
  }

  const now = Date.now();
  ledgersCache[bookId] = {
    bookId,
    lastModified: now,
    transactions,
    categories,
  };
  persistLedgers();
  notifyPollers(bookId, ledgersCache[bookId]);

  res.json({
    success: true,
    lastModified: now,
  });
});

// 3. GET /api/ledger/:bookId/poll?since=<timestamp> - Real-time long polling
app.get('/api/ledger/:bookId/poll', (req: Request, res: Response) => {
  const bookId = (req.params.bookId || 'utama').trim().toLowerCase();
  const since = Number(req.query.since) || 0;
  const ledger = getOrCreateLedger(bookId);

  // If data modified since given timestamp, respond immediately
  if (ledger.lastModified > since) {
    res.json({
      modified: true,
      lastModified: ledger.lastModified,
      transactions: ledger.transactions,
      categories: ledger.categories,
    });
    return;
  }

  // Otherwise, hold connection for up to 15 seconds waiting for updates
  if (!activePollers[bookId]) {
    activePollers[bookId] = [];
  }

  const poller = { res, since };
  activePollers[bookId].push(poller);

  const timeoutId = setTimeout(() => {
    // Remove from active pollers
    const idx = activePollers[bookId]?.indexOf(poller);
    if (idx !== undefined && idx > -1) {
      activePollers[bookId].splice(idx, 1);
    }
    if (!res.writableEnded) {
      res.json({ modified: false, lastModified: ledger.lastModified });
    }
  }, 15000);

  req.on('close', () => {
    clearTimeout(timeoutId);
    const idx = activePollers[bookId]?.indexOf(poller);
    if (idx !== undefined && idx > -1) {
      activePollers[bookId].splice(idx, 1);
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BukuKas Rupiah server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
