import app from '../server-dist/index.js';

// Helpful guard to fail fast with a clear message if env vars are missing
const requiredEnv = ['DATABASE_URL'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
}

export default function handler(req: any, res: any) {
  try {
    if (missing.length) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: `Missing environment variables: ${missing.join(', ')}` }));
      return;
    }
    return app(req, res);
  } catch (err: any) {
    console.error('API handler error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
}
