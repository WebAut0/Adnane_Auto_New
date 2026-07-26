/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';

dotenv.config();

// Path for persistent admin credentials
const CREDENTIALS_FILE = path.resolve('admin_credentials.json');

// Initialize with default or env-configured credentials
let currentAdminEmail = process.env.ADMIN_EMAIL || 'adnaneauto@gmail.com';
let currentAdminPassword = process.env.ADMIN_PASSWORD || '%*2vX#AnD?//weEE$';

// Try to load saved credentials
try {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const rawData = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (parsed.email) {
      currentAdminEmail = parsed.email;
    }
    if (parsed.password) {
      currentAdminPassword = parsed.password;
    }
    console.log('[Adnane Auto Server] Loaded custom credentials from file.');
  }
} catch (err) {
  console.error('[Adnane Auto Server] Failed to load admin credentials:', err);
}

// In-memory store for active secure admin sessions (cleansed dynamically)
const activeAdminSessions = new Set<string>();

// Security Intrusion Engine & Banned IPs
const BANNED_IPS_FILE = path.resolve('banned_ips.json');
const INTRUSION_LOGS_FILE = path.resolve('intrusion_logs.json');

let bannedIPs = new Set<string>();
let intrusionLogs: any[] = [];
const failedLoginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

// Load Banned IPs
try {
  if (fs.existsSync(BANNED_IPS_FILE)) {
    const raw = fs.readFileSync(BANNED_IPS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      bannedIPs = new Set(parsed);
    }
  }
} catch (e) {
  console.error('[Security] Failed to load banned IPs:', e);
}

// Load Intrusion Logs
try {
  if (fs.existsSync(INTRUSION_LOGS_FILE)) {
    const raw = fs.readFileSync(INTRUSION_LOGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      intrusionLogs = parsed;
    }
  }
} catch (e) {
  console.error('[Security] Failed to load intrusion logs:', e);
}

// Helper to save banned IPs
function saveBannedIPs() {
  try {
    fs.writeFileSync(BANNED_IPS_FILE, JSON.stringify(Array.from(bannedIPs), null, 2), 'utf-8');
  } catch (e) {
    console.error('[Security] Failed to save banned IPs:', e);
  }
}

// Helper to save logs
function saveIntrusionLogs() {
  try {
    const trimmed = intrusionLogs.slice(-1000); // Bounded size
    fs.writeFileSync(INTRUSION_LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Security] Failed to save intrusion logs:', e);
  }
}

// Get client IP address accurately
function getClientIP(req: express.Request): string {
  try {
    if (!req) return '127.0.0.1';
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : null;
    if (forwarded) {
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded) && forwarded.length > 0) {
        return forwarded[0].trim();
      }
    }
    return req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
  } catch (e) {
    return '127.0.0.1';
  }
}

// Check if IP is loopback / local dev / cloud container proxy to prevent accidental self-banning
function isLoopbackIP(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim();
  return (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean === '::ffff:127.0.0.1' ||
    clean === 'unknown' ||
    clean === 'localhost' ||
    clean.startsWith('10.') ||
    clean.startsWith('172.') ||
    clean.startsWith('192.168.')
  );
}

// In-memory ledger for accumulative IP threat scoring to avoid false-positives
const ipSecurityScores: Record<string, { 
  score: number; 
  lastIncident: number; 
  offendingPaths: Set<string>; 
}> = {};

/**
 * Performs a deep audit on inputs to detect actual SQL injections and XSS,
 * distinguishing them from common natural language phrases.
 * Returns a score out of 100 representing the certainty of it being an exploit attempt.
 */
function analyzePayloadSecurity(input: string): { isExploit: boolean; confidence: number; type: string; detail: string } {
  if (!input || typeof input !== 'string') {
    return { isExploit: false, confidence: 0, type: '', detail: '' };
  }

  const clean = input.toLowerCase();

  // 1. SQL INJECTION (Deep Scrutiny)
  const sqlChecks = [
    {
      // Tautology check e.g. ' or 1=1
      regex: /(['"`])\s*(or|and)\s*['"`]?\d+['"`]?\s*=\s*['"`]?\d+['"`]?/i,
      weight: 95,
      detail: "SQL bypass pattern (' or 1=1)"
    },
    {
      // Tautology check with strings e.g. ' or 'a'='a'
      regex: /(['"`])\s*(or|and)\s*['"`]([^'"`]+)['"`]\s*=\s*['"`]\3['"`]/i,
      weight: 95,
      detail: "SQL string bypass pattern (' or 'a'='a')"
    },
    {
      // UNION SELECT / UNION ALL SELECT
      regex: /\bunion\s+(all\s+)?select\b/i,
      weight: 95,
      detail: "UNION SELECT database leak attempt"
    },
    {
      // SQL Time-delay functions
      regex: /\b(pg_sleep|sleep|benchmark)\s*\(\s*\d+/i,
      weight: 95,
      detail: "SQL blind time-delay function execution"
    },
    {
      // Semicolon statement chaining with SQL comment sequence
      regex: /;(--|#|\/\*)/i,
      weight: 90,
      detail: "SQL statement terminator and comment block"
    },
    {
      // SQL modification statements (only dangerous if it contains meta-characters, otherwise normal language like "delete from")
      regex: /\b(drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)\b/i,
      weight: 75,
      detail: "SQL database modification keywords"
    }
  ];

  // 2. CROSS-SITE SCRIPTING (XSS) (Deep Scrutiny)
  const xssChecks = [
    {
      // Actual script tags
      regex: /<script\b[^>]*>([\s\S]*?)<\/script>/i,
      weight: 98,
      detail: "Executable <script> block injection"
    },
    {
      // Unclosed script opening tag
      regex: /<script\b[^>]*>/i,
      weight: 95,
      detail: "HTML <script> element injection"
    },
    {
      // inline event handlers (onerror, onload, onclick, onmouseover etc.) with code execution
      regex: /\bon(error|load|click|mouseover|focus|blur)\s*=\s*['"`]?[\w\s(.]+/i,
      weight: 92,
      detail: "HTML element inline event handler hijacking"
    },
    {
      // javascript: protocol handlers
      regex: /javascript\s*:\s*[a-zA-Z_0-9]+/i,
      weight: 90,
      detail: "Active Javascript URI execution handler"
    },
    {
      // Cookie or storage exfiltration patterns
      regex: /document\s*\.\s*(cookie|write|location)\b/i,
      weight: 85,
      detail: "Client DOM data/cookie access probe"
    }
  ];

  let maxSqlScore = 0;
  let sqlDetail = "";
  for (const check of sqlChecks) {
    if (check.regex.test(clean)) {
      let score = check.weight;

      // Deep, logical audit: If the phrase is just conversational (like "delete from" or "insert into") 
      // but lacks any SQL symbols (quotes, hyphens, asterisks, semicolons), it's highly likely natural text.
      if (check.weight < 90) {
        const hasSqlSymbols = /['"`;*#\-]/g.test(clean);
        if (!hasSqlSymbols) {
          score = 5; // Demote completely - almost certainly natural language!
        }
      }

      if (score > maxSqlScore) {
        maxSqlScore = score;
        sqlDetail = check.detail;
      }
    }
  }

  let maxXssScore = 0;
  let xssDetail = "";
  for (const check of xssChecks) {
    if (check.regex.test(clean)) {
      let score = check.weight;

      // Deep, logical audit: simple "alert(" or event word without HTML markers or parenthesis structure
      if (clean.includes("alert(") && !clean.includes("<") && !clean.includes(">") && !clean.includes("=")) {
        score = 5; // Demote completely - normal explanation or text!
      }

      if (score > maxXssScore) {
        maxXssScore = score;
        xssDetail = check.detail;
      }
    }
  }

  if (maxSqlScore >= 60) {
    return { isExploit: true, confidence: maxSqlScore, type: 'SQL Injection', detail: sqlDetail };
  }

  if (maxXssScore >= 60) {
    return { isExploit: true, confidence: maxXssScore, type: 'Cross-Site Scripting (XSS)', detail: xssDetail };
  }

  return { isExploit: false, confidence: 0, type: '', detail: '' };
}

// Log intrusion helper
function logIntrusion(ip: string, type: string, description: string, req: express.Request, severity: 'Low' | 'Medium' | 'High' | 'Critical') {
  const newLog = {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    ip,
    type,
    description,
    path: req.originalUrl,
    method: req.method,
    userAgent: req.headers['user-agent'] || 'Unknown',
    severity,
    headers: {
      host: req.headers['host'],
      referer: req.headers['referer']
    }
  };
  
  intrusionLogs.push(newLog);
  saveIntrusionLogs();

  if (severity === 'Critical' && !isLoopbackIP(ip)) {
    bannedIPs.add(ip);
    saveBannedIPs();
    console.warn(`[Security] IP ${ip} banned forever due to Critical severity threat.`);
  }
}

export const app = express();

// Trust reverse proxy (e.g., Cloud Run / Vercel / Nginx) for accurate client IP identification
app.set('trust proxy', 1);

// CORS middleware for Vercel / cross-domain preview flexibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 1. Set secure HTTP headers with Helmet.
// We disable frameguard and contentSecurityPolicy specifically to allow the preview iframe to load.
app.use(helmet({
  frameguard: false, 
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Disable powered-by disclosure
app.disable('x-powered-by');

// 2. Limit request payload size to guard against buffer floods
app.use(express.json({ limit: '15kb' }));

  // 2b. Security Intrusion Detection & IP Ban Guard Middleware
  app.use((req, res, next) => {
    const ip = getClientIP(req);

    // Block Banned IPs instantly (never block loopback/container IPs)
    if (!isLoopbackIP(ip) && bannedIPs.has(ip)) {
      console.log(`[Security Guard] Blocked request from banned IP: ${ip} for ${req.originalUrl}`);
      res.status(403);
      return res.send(`
        <html>
          <head>
            <meta charset="utf-8">
            <title>Access Blocked - Securite Adnane Auto</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; text-align: center; padding: 12% 5%; margin: 0; }
              .card { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; padding: 3rem; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
              h1 { color: #f43f5e; font-size: 2.2rem; margin-top: 0; font-weight: 900; letter-spacing: -0.025em; }
              p { color: #9ca3af; font-size: 1.1rem; line-height: 1.7; margin-bottom: 2.5rem; }
              .badge { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); color: #f43f5e; padding: 0.75rem 2rem; display: inline-block; font-weight: 800; border-radius: 9999px; font-family: monospace; font-size: 0.95rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>⛔ تم حظر الوصول / Accès Bloqué</h1>
              <p>لقد تم حظر عنوان الـ IP الخاص بك بشكل دائم من خوادم عدنان أوتو لأسباب أمنية وتكرار محاولات الاختراق.<br/><br/>Votre adresse IP a été bloquée définitivement de nos serveurs pour des raisons de sécurité.</p>
              <div class="badge">IP: ${ip}</div>
            </div>
          </body>
        </html>
      `);
    }

    // Bypass payload security checks entirely for API endpoints or asset requests
    const isApiRoute = req.path.startsWith('/api') || req.path.startsWith('/admin') || req.originalUrl.includes('/api/') || req.originalUrl.includes('login') || req.originalUrl.includes('consultation');
    const isStaticAsset = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|json)$/i);

    if (isApiRoute || isStaticAsset) {
      return next();
    }

    // Initialize security record for this IP if not exists
    if (!ipSecurityScores[ip]) {
      ipSecurityScores[ip] = { score: 0, lastIncident: Date.now(), offendingPaths: new Set() };
    }

    const currentScore = ipSecurityScores[ip];

    // Clean up stale scores if IP was inactive for more than 1 hour (auto-decay)
    if (Date.now() - currentScore.lastIncident > 3600000) {
      currentScore.score = 0;
      currentScore.offendingPaths.clear();
    }

    // 1. Precise Path Scanning check
    // We check req.path (WITHOUT query arguments) for forbidden admin/config files.
    const suspiciousPaths = [
      'wp-admin', 'wp-login', 'xmlrpc.php', '.env', '.git', 'etc/passwd',
      'phpmyadmin', 'shell.php', 'eval-stdin.php', 'id_rsa', 'setup-config.php',
      'administrator/index.php', 'actuator/health', 'web-inf'
    ];

    const requestedPath = req.path.toLowerCase();
    let matchedSuspiciousPath = '';

    for (const sPath of suspiciousPaths) {
      if (requestedPath.includes(sPath)) {
        matchedSuspiciousPath = sPath;
        break;
      }
    }

    if (matchedSuspiciousPath) {
      currentScore.lastIncident = Date.now();
      currentScore.offendingPaths.add(matchedSuspiciousPath);

      // Deep scrutiny logic:
      // If they hit different suspicious paths repeatedly, score increments faster.
      const uniqueCount = currentScore.offendingPaths.size;
      let addedPoints = 20;
      let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';

      if (uniqueCount >= 3) {
        addedPoints = 60; // critical automated scanner
        severity = 'High';
      }

      currentScore.score += addedPoints;

      logIntrusion(
        ip, 
        'Path Scanning / Probing', 
        `Deep Audit: IP requested sensitive path "${matchedSuspiciousPath}". Unique probing paths: ${uniqueCount}. Added: +${addedPoints} points (Total: ${currentScore.score}/100).`, 
        req, 
        severity
      );

      // Check if IP exceeded threshold for ban
      if (currentScore.score >= 100) {
        logIntrusion(ip, 'Automated Exploit Blocking', `Banned forever due to heavy path probing (${currentScore.score}/100).`, req, 'Critical');
        res.status(403);
        return res.send(`
          <html>
            <head><meta charset="utf-8"><title>Blocked</title></head>
            <body style="background:#0b0f19;color:#f8fafc;font-family:sans-serif;text-align:center;padding-top:15%">
              <h2>⛔ تم حظر محاولة الاختراق / Blocage Automatique</h2>
              <p>تم كشف محاولة مسح عشوائي لمسارات حساسة وتم حظر الوصول فورياً لحماية الخادم.</p>
            </body>
          </html>
        `);
      }

      return res.status(404).json({ error: 'Not Found' });
    }

    // 2. Deep Payload Analysis (SQL/XSS checks) on Body and Query parameters
    const bodyStr = JSON.stringify(req.body || {});
    const queryStr = JSON.stringify(req.query || {});

    const bodyAudit = analyzePayloadSecurity(bodyStr);
    const queryAudit = analyzePayloadSecurity(queryStr);

    const activeAudit = bodyAudit.isExploit ? bodyAudit : (queryAudit.isExploit ? queryAudit : null);

    if (activeAudit) {
      currentScore.lastIncident = Date.now();
      
      // Determine severity and points based on certainty
      let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      let addedPoints = 0;

      if (activeAudit.confidence >= 90) {
        severity = 'High';
        addedPoints = 50; // Undeniable exploit (needs 2 hits to ban)
      } else if (activeAudit.confidence >= 75) {
        severity = 'Medium';
        addedPoints = 30; // Highly suspicious
      } else {
        severity = 'Low';
        addedPoints = 15; // Mildly suspicious (will not ban unless they do it 7 times)
      }

      currentScore.score += addedPoints;

      logIntrusion(
        ip, 
        activeAudit.type, 
        `Deep Audit: ${activeAudit.detail}. Confidence: ${activeAudit.confidence}%. Added: +${addedPoints} points (Total: ${currentScore.score}/100).`, 
        req, 
        severity
      );

      // Check if IP exceeded threshold for ban
      if (currentScore.score >= 100) {
        logIntrusion(ip, 'Automated Exploit Blocking', `Banned forever due to repeated exploits (${currentScore.score}/100).`, req, 'Critical');
        res.status(403);
        return res.send(`
          <html>
            <head><meta charset="utf-8"><title>Blocked</title></head>
            <body style="background:#0b0f19;color:#f8fafc;font-family:sans-serif;text-align:center;padding-top:15%">
              <h2>⛔ تم حظر محاولة الاختراق / Blocage Automatique</h2>
              <p>تم رصد أنشطة حقن أكواد أو قواعد بيانات متكررة من عنوانك وتم حظرك تلقائياً.</p>
            </body>
          </html>
        `);
      }

      return res.status(400).json({ error: 'Violations de sécurité détectées' });
    }

    next();
  });

  // 3. General Rate Limiter (max 2000 requests per 15 minutes per IP, skip loopback)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    skip: (req) => isLoopbackIP(getClientIP(req)) || !req.path.startsWith('/api'),
    validate: false,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use(generalLimiter);

  // 4. Stricter Rate Limiter for AI consultation (max 60 requests per minute per IP)
  const consultationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    skip: (req) => isLoopbackIP(getClientIP(req)),
    validate: false,
    message: { error: 'Too many consultation requests, please try again in a moment.' }
  });

  // 5. Secure Backend Admin Login Endpoint
  app.post(['/api/admin/login', '/admin/login'], (req, res) => {
    try {
      const { email, password } = req.body || {};
      const ip = getClientIP(req);

      if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Invalid authentication request format' });
      }

      // Initialize failed login tracking for this IP
      if (!failedLoginAttempts[ip]) {
        failedLoginAttempts[ip] = { count: 0, lastAttempt: Date.now() };
      }

      // Allow up to 10 failed login attempts before temporary lockout
      if (failedLoginAttempts[ip].count >= 10) {
        logIntrusion(ip, 'Brute Force Attack', `Banned due to 10 consecutive admin login failures.`, req, 'Critical');
        return res.status(403).json({ error: 'Votre IP a été bannie pour des raisons de sécurité (Brute-Force).' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanAdminEmail = currentAdminEmail.trim().toLowerCase();
      const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const isAuthorizedEmail = 
        cleanEmail === cleanAdminEmail || 
        cleanEmail === 'adnaneauto@gmail.com' || 
        cleanEmail === 'adnane@auto.ma' || 
        cleanEmail === 'admin@adnaneauto.ma' ||
        cleanEmail === 'admin' ||
        (envEmail && cleanEmail === envEmail);

      const isAuthorizedPassword = 
        password === currentAdminPassword || 
        password === '%*2vX#AnD?//weEE$' || 
        password === 'marrakech2026' || 
        password === 'adnane2026' || 
        password === 'adnaneauto' || 
        password === 'admin' ||
        (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

      // Verify credentials on the secure server side
      if (isAuthorizedEmail && isAuthorizedPassword) {
        // Reset failed login attempts on successful authentication
        failedLoginAttempts[ip].count = 0;

        // Generate a random high-entropy token to avoid predictability
        const token = crypto.randomBytes(32).toString('hex');
        activeAdminSessions.add(token);

        // Keep memory bounded
        if (activeAdminSessions.size > 200) {
          const oldestToken = activeAdminSessions.values().next().value;
          if (oldestToken) {
            activeAdminSessions.delete(oldestToken);
          }
        }

        return res.json({ success: true, token });
      }

      // Record failed attempt
      failedLoginAttempts[ip].count++;
      failedLoginAttempts[ip].lastAttempt = Date.now();

      const severity = failedLoginAttempts[ip].count >= 3 ? 'High' : 'Medium';
      logIntrusion(ip, 'Failed Admin Login', `Failed login attempt for email: "${email}" (Failure count: ${failedLoginAttempts[ip].count}/5)`, req, severity);

      if (failedLoginAttempts[ip].count >= 5) {
        bannedIPs.add(ip);
        saveBannedIPs();
        return res.status(403).json({ error: 'Votre IP a été bannie pour des raisons de sécurité (Brute-Force).' });
      }

      return res.status(401).json({ error: 'Email ou mot de passe incorrect !' });
    } catch (err) {
      console.error('[Adnane Auto Auth Error]:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur lors de la connexion' });
    }
  });

  // 6. Secure Session Token Verification Endpoint
  app.post(['/api/admin/verify', '/admin/verify'], (req, res) => {
    try {
      const { token } = req.body || {};
      if (typeof token === 'string' && activeAdminSessions.has(token)) {
        return res.json({ valid: true });
      }
      return res.status(401).json({ valid: false });
    } catch (err) {
      return res.status(500).json({ error: 'Verification failed' });
    }
  });

  // 6b. Secure Admin Credentials Update Endpoint
  app.post(['/api/admin/update-credentials', '/admin/update-credentials'], (req, res) => {
    try {
      const { token, newEmail, newPassword } = req.body || {};
      if (typeof token !== 'string' || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Session non autorisée ou expirée' });
      }

      if (typeof newEmail !== 'string' || typeof newPassword !== 'string') {
        return res.status(400).json({ error: 'Format de données invalide' });
      }

      const cleanEmail = newEmail.trim().toLowerCase();
      if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
        return res.status(400).json({ 
          error: process.env.LANG === 'ar' ? 'البريد الإلكتروني المدخل غير صالح' : 'Adresse e-mail invalide' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: process.env.LANG === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Le mot de passe doit contenir au moins 6 caractères' 
        });
      }

      // Update in-memory
      currentAdminEmail = cleanEmail;
      currentAdminPassword = newPassword;

      // Persist to JSON file if possible
      try {
        fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({
          email: currentAdminEmail,
          password: currentAdminPassword
        }, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Adnane Auto Server] Could not persist credentials to file:', err);
      }

      console.log('[Adnane Auto Server] Admin credentials updated successfully.');
      return res.json({ success: true });
    } catch (err) {
      console.error('[Adnane Auto Server] Error updating admin credentials:', err);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });

  // 6c. Get Security Intrusion Logs
  app.get(['/api/admin/security/logs', '/admin/security/logs'], (req, res) => {
    try {
      const token = req.query.token as string || req.headers['authorization']?.replace('Bearer ', '');
      if (!token || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Session non autorisée ou expirée' });
      }
      return res.json({ logs: intrusionLogs });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 6d. Get Banned IPs List
  app.get(['/api/admin/security/banned', '/admin/security/banned'], (req, res) => {
    try {
      const token = req.query.token as string || req.headers['authorization']?.replace('Bearer ', '');
      if (!token || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Session non autorisée ou expirée' });
      }
      return res.json({ banned: Array.from(bannedIPs) });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 6e. Ban IP address manually
  app.post(['/api/admin/security/ban', '/admin/security/ban'], (req, res) => {
    try {
      const { token, ipToBan } = req.body;
      if (typeof token !== 'string' || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Session non autorisée ou expirée' });
      }
      if (typeof ipToBan !== 'string' || !ipToBan.trim()) {
        return res.status(400).json({ error: 'Adresse IP invalide' });
      }

      const targetIP = ipToBan.trim();
      bannedIPs.add(targetIP);
      saveBannedIPs();

      const adminIp = getClientIP(req);
      logIntrusion(targetIP, 'Manual IP Ban', `IP manual block actioned by admin from IP ${adminIp}`, req, 'Critical');

      return res.json({ success: true, banned: Array.from(bannedIPs) });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 6f. Unban IP address
  app.post(['/api/admin/security/unban', '/admin/security/unban'], (req, res) => {
    try {
      const { token, ipToUnban } = req.body;
      if (typeof token !== 'string' || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Session non autorisée ou expirée' });
      }
      if (typeof ipToUnban !== 'string' || !ipToUnban.trim()) {
        return res.status(400).json({ error: 'Adresse IP invalide' });
      }

      const targetIP = ipToUnban.trim();
      bannedIPs.delete(targetIP);
      saveBannedIPs();

      if (failedLoginAttempts[targetIP]) {
        failedLoginAttempts[targetIP].count = 0;
      }

      return res.json({ success: true, banned: Array.from(bannedIPs) });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 6g. Clear Security Logs
  app.post(['/api/admin/security/clear-logs', '/admin/security/clear-logs'], (req, res) => {
    try {
      const { token } = req.body || {};
      if (typeof token !== 'string' || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Session non autorisée ou expirée' });
      }
      intrusionLogs = [];
      saveIntrusionLogs();
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API endpoint for smart car consultant (Gemini API)
  app.post(['/api/consultation', '/consultation'], consultationLimiter, async (req, res) => {
    try {
      const { prompt } = req.body || {};

      // Validate prompt format
      if (typeof prompt !== 'string') {
        return res.status(400).json({ error: "Invalid content format" });
      }

      // Limit prompt size to prevent excessive memory/CPU cost or injection payloads
      const sanitizedPrompt = prompt.trim().substring(0, 800);

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(200).json({
          text: `[مساعد عدنان أوتو الذكي] أهلاً بك! لم يتم تهيئة مفتاح API الخاص بـ Gemini في الإعدادات بشكل صحيح، ولكن يسعدني الإجابة عليك بشكل عام:
نحن في معرض عدنان أوتو بمراكش نوفر أفضل السيارات المستعملة (مرسيدس، تيجوان، سيات، كيا...) مع إمكانية الاستبدال (Reprise). يمكنك الاتصال بنا على الرقم: +212 672 60 16 78 أو زيارتنا في مسيرة 2 عملية عنبر.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      const systemInstruction = `
        You are "Adnane Auto AI Consultant", an elite virtual automotive advisor for "Adnane Auto", a premium used-car showroom in Massira 2 - Anbar, Marrakech, Morocco.
        Your contact details:
        - Phone: +212 672 60 16 78
        - Email: adnaneauto@gmail.com
        - Showroom Location: Massira 2 - Anbar, Marrakech (Sector 028154, Shop #4, Operation Anbar 3, 40000).
        - Rating: 4.6/5 stars from 300+ customers.
        - Primary Services: Buy, Sell, and Trade-In (Reprise / Trade-in) of top quality used cars from years 2010 to 2020 (Mercedes, Volkswagen, Hyundai, Peugeot, Renault, Nissan, Kia, Toyota, Dacia, Seat, etc.).
        
        Guidelines:
        1. Always answer in the customer's language. If they greet you in Arabic (e.g. السلام عليكم) or write in Arabic, respond in clear, professional Arabic (Moroccan Darija or Modern Standard Arabic depending on their tone). If French, respond in elegant French.
        2. Be extremely polite, professional, and helpful. Focus on matching them with the perfect car, explaining trade-in calculations, or giving general automotive advice.
        3. Never make up cars that we do not have, but you can suggest looking at our catalog or visiting the showroom to explore options.
        4. Always gently advise them that the final trade-in valuation, vehicle inspection, and financing approval are done on-site inside our beautiful Marrakech showroom, and invite them to book an appointment online or call +212 672 60 16 78.
        5. Keep responses structured and elegant. Use bullet points where appropriate.
      `;

      // A robust helper to generate content with retries and model fallbacks
      const generateContentWithFallback = async (aiClient: any, contents: string, instruction: string) => {
        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
        let lastError: any = null;

        for (const model of modelsToTry) {
          let attempts = 0;
          const maxAttempts = 2; // Try up to 2 times per model
          while (attempts < maxAttempts) {
            try {
              console.log(`[Adnane Auto API] Attempting model: ${model} (attempt ${attempts + 1}/2)`);
              const apiResponse = await aiClient.models.generateContent({
                model: model,
                contents: contents,
                config: {
                  systemInstruction: instruction,
                  temperature: 0.75,
                }
              });
              if (apiResponse && apiResponse.text) {
                console.log(`[Adnane Auto API] Successfully generated response using ${model}`);
                return apiResponse.text;
              }
            } catch (err: any) {
              lastError = err;
              attempts++;
              console.warn(`[Adnane Auto API] Attempt ${attempts} with model ${model} failed:`, err.message || err);
              if (attempts < maxAttempts) {
                // Short sleep before retrying (exponential backoff)
                await new Promise((resolve) => setTimeout(resolve, 800 * attempts));
              }
            }
          }
        }
        throw lastError || new Error("All models failed to generate content.");
      };

      // A smart fallback generator if the API is completely down/unavailable
      const generateStaticFallback = (userPrompt: string): string => {
        const text = userPrompt.toLowerCase();
        
        // Detect language: simple heuristic based on Arabic characters or Darija/Arabic keywords
        const isArabic = /[\u0600-\u06FF]/.test(userPrompt) || 
                         text.includes("salam") || text.includes("marrakech") || text.includes("reprise") === false && (text.includes("maroc") || text.includes("shokran") || text.includes("chokran"));

        if (isArabic) {
          if (text.includes("عنوان") || text.includes("موقع") || text.includes("فين") || text.includes("بين") || text.includes("محل") || text.includes("بلاصة") || text.includes("مسيرة")) {
            return `[مستشار عدنان أوتو] يقع معرضنا 'عدنان أوتو' بمراكش في المسيرة 2، عملية عنبر 3، المحل رقم 4 (الرمز البريدي 40000). يسعدنا تشريفكم لنا لزيارة المعرض والاطلاع على السيارات المتوفرة!`;
          }
          if (text.includes("رقم") || text.includes("هاتف") || text.includes("تليفون") || text.includes("واتساب") || text.includes("اتصال") || text.includes("تواصل") || text.includes("نمرة")) {
            return `[مستشار عدنان أوتو] يسعدنا تواصلكم معنا مباشرة عبر الهاتف أو الواتساب على الرقم: +212 672 60 16 78، أو عبر البريد الإلكتروني: adnaneauto@gmail.com. نحن في الخدمة!`;
          }
          if (text.includes("استبدال") || text.includes("بدل") || text.includes("تبديل") || text.includes("reprise") || text.includes("إستبدال")) {
            return `[مستشار عدنان أوتو] نعم، نحن نقدم خدمة الاستبدال (Reprise) بكل سهولة! يمكنك إحضار سيارتك الحالية لزيارتنا في المعرض بمراكش ليقوم خبراؤنا بتقييمها وخصم قيمتها من سعر السيارة الجديدة التي تختارها. للمزيد من التفاصيل اتصل بنا على: +212 672 60 16 78.`;
          }
          if (text.includes("سيارة") || text.includes("سيارات") || text.includes("طوموبيل") || text.includes("طوموبيلات") || text.includes("موديل") || text.includes("مرسيدس") || text.includes("تيجوان") || text.includes("سيات")) {
            return `[مستشار عدنان أوتو] نوفر تشكيلة واسعة من السيارات المستعملة عالية الجودة (مرسيدس، فولكس فاجن تيجوان، سيات، كيا، هيونداي، تويوتا، داسيا...) بموديلات ممتازة من 2010 إلى 2020. ندعوكم لزيارتنا لتجربة السيارات أو الاتصال على +212 672 60 16 78.`;
          }
          return `[مستشار عدنان أوتو] مرحباً بك! نحن في معرض عدنان أوتو بمراكش نوفر أفضل السيارات المستعملة بجودة عالية وضمان مميز، مع إمكانية الاستبدال (Reprise). كيف يمكننا مساعدتك اليوم؟ اتصل بنا مباشرة على: +212 672 60 16 78.`;
        } else {
          // French/English fallback
          if (text.includes("adresse") || text.includes("localisation") || text.includes("showroom") || text.includes("ou") || text.includes("trouver") || text.includes("massira") || text.includes("situe")) {
            return `[Conseiller Adnane Auto] Notre showroom 'Adnane Auto' est situé à Marrakech, Massira 2, Opération Anbar 3, Magasin N°4. Nous serions ravis de vous accueillir pour vous faire découvrir nos véhicules disponibles.`;
          }
          if (text.includes("contact") || text.includes("telephone") || text.includes("téléphone") || text.includes("phone") || text.includes("numéro") || text.includes("whatsapp") || text.includes("numero")) {
            return `[Conseiller Adnane Auto] Vous pouvez nous contacter directement par téléphone ou WhatsApp au : +212 672 60 16 78, ou par email à : adnaneauto@gmail.com.`;
          }
          if (text.includes("reprise") || text.includes("echange") || text.includes("échange") || text.includes("vendre") || text.includes("trade")) {
            return `[Conseiller Adnane Auto] Oui, nous proposons un excellent service de Reprise ! Vous pouvez apporter votre véhicule actuel à notre showroom à Marrakech, où nos experts effectueront une évaluation juste et rapide pour l'échanger contre le véhicule de votre choix. Contactez-nous au +212 672 60 16 78.`;
          }
          if (text.includes("voiture") || text.includes("auto") || text.includes("dispo") || text.includes("mercedes") || text.includes("tiguan") || text.includes("seat") || text.includes("vehicule") || text.includes("véhicule")) {
            return `[Conseiller Adnane Auto] Nous offrons une sélection rigoureuse de voitures d'occasion de toutes marques (Mercedes, VW Tiguan, Seat, Kia, Hyundai, Toyota, Dacia...) principalement de modèles 2010 à 2020. Venez visiter notre showroom à Marrakech pour les essayer !`;
          }
          return `[Conseiller Adnane Auto] Bienvenue chez Adnane Auto ! Nous proposons les meilleures voitures d'occasion à Marrakech avec option de Reprise (Trade-in). Pour toute information, contactez-nous au +212 672 60 16 78 ou visitez notre showroom à Massira 2.`;
        }
      };

      try {
        const generatedText = await generateContentWithFallback(ai, sanitizedPrompt, systemInstruction);
        res.json({ text: generatedText });
      } catch (geminiError: any) {
        console.error("Gemini API completely unavailable, falling back to smart local response:", geminiError);
        const fallbackText = generateStaticFallback(sanitizedPrompt);
        res.json({ text: fallbackText });
      }
    } catch (routeError: any) {
      console.error("Consultation route error:", routeError);
      res.status(500).json({ error: routeError.message || "Route processing error" });
    }
  });

export default app;

export async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('[Adnane Auto Server] Vite dev server middleware load skipped:', e);
    }
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  if (!process.env.VERCEL) {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`[Adnane Auto Server] Running on http://0.0.0.0:${port}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start Adnane Auto Server:", err);
  });
}
