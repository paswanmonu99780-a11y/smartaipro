import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const upload = multer({ storage: multer.memoryStorage() });

// In-memory user storage
const users: any[] = [];
const currentUser: any = null; // Simple session simulation for demo

export async function createApp(options: { serveStatic?: boolean } = {}) {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const nvidiaApiKey = process.env.NVIDIA_API_KEY;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_SheglkgbIFBx3Q';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '12EgvmXHWf4djX7CGtH3iNuV';
  const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

  app.use(cors());
  app.use(express.json());

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateGeminiChatText = async (prompt: string, system?: string) => {
    if (!genAI) return null;

    const modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    const fullPrompt = `${system?.trim() ? `System: ${system.trim()}\n\n` : ''}${prompt}`;

    for (const model of modelCandidates) {
      try {
        const response: any = await genAI.models.generateContent({
          model,
          contents: fullPrompt
        });

        const text = (response?.text || '').trim();
        if (text) return text;
      } catch {
        continue;
      }
    }

    return null;
  };

  const generateOllamaChatText = async (prompt: string, system?: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s strict timeout

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama3",
          messages: [
            { role: "system", content: system || "You are SmartAI Pro assistant." },
            { role: "user", content: prompt }
          ],
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data: any = await response.json();
      return data.message?.content || null;
    } catch {
      return null;
    }
  };

  const generateGroqChatText = async (prompt: string, system?: string) => {
    if (!groqApiKey) return null;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: system || "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error('[Groq] Error:', err);
      return null;
    }
  const generateNvidiaChatText = async (prompt: string, system?: string) => {
    if (!nvidiaApiKey) return null;
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "step-3.5-flash",
          messages: [
            { role: "system", content: system || "You are SmartAI Pro Jarvis assistant." },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 1024,
          stream: false
        })
      });
      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error('[NVIDIA] Error:', err);
      return null;
    }
  };

  const pickAspectRatio = (w: number, h: number) => {
    if (!w || !h) return '1:1';
    if (Math.abs(w / h - 1) < 0.08) return '1:1';
    if (Math.abs(w / h - 16 / 9) < 0.2) return '16:9';
    if (Math.abs(w / h - 9 / 16) < 0.2) return '9:16';
    if (Math.abs(w / h - 4 / 3) < 0.2) return '4:3';
    if (Math.abs(w / h - 3 / 4) < 0.2) return '3:4';
    return w >= h ? '16:9' : '9:16';
  };

  const generateGeminiImage = async (prompt: string, width: number, height: number, seed: number) => {
    if (!genAI) return null;

    const aspectRatio = pickAspectRatio(width, height);
    const modelCandidates = [
      'imagen-3.0-generate-002',
      'imagen-3.0-fast-generate-001',
      'imagen-4.0-generate-preview-06-06'
    ];

    for (const model of modelCandidates) {
      try {
        const response: any = await genAI.models.generateImages({
          model,
          prompt,
          config: {
            numberOfImages: 1,
            aspectRatio,
            outputMimeType: 'image/png',
            seed
          }
        });

        const image = response?.generatedImages?.[0]?.image;
        const base64 = image?.imageBytes || image?.data;
        const mimeType = image?.mimeType || image?.mime_type || 'image/png';

        if (!base64) continue;
        const buffer = Buffer.from(base64, 'base64');
        if (!buffer.length) continue;

        return { buffer, mimeType };
      } catch {
        continue;
      }
    }

    return null;
  };

  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });

  // 2. TEST ROUTE
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 3. AUTH SYSTEM
  app.post("/api/auth/signup", (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = { 
      id: Date.now(), 
      email, 
      password, 
      credits: 100, 
      plan: 'Basic',
      history: [] 
    };
    users.push(newUser);
    
    console.log(`[Auth] New user signed up: ${email}`);
    res.json({ message: "Signup successful", user: { id: newUser.id, email: newUser.email, credits: newUser.credits } });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`[Auth] User logged in: ${email}`);
    res.json({ 
      message: "Login successful", 
      user: { 
        id: user.id, 
        email: user.email, 
        credits: user.credits || 100,
        plan: user.plan || 'Basic',
        history: user.history || []
      } 
    });
  });

  app.get("/api/auth/me", (req, res) => {
    res.json({ user: users.length > 0 ? { id: users[0].id, email: users[0].email } : null });
  });

  // 4. PAYMENT SYSTEM
  app.post("/api/payment/create-order", async (req, res) => {
    const { plan, email } = req.body;
    if (!plan || !email) {
      return res.status(400).json({ error: "Plan and email are required" });
    }

    const amountMap: Record<string, number> = {
      'Pro': 9900,
      'Ultra': 19900
    };

    const amount = amountMap[plan];
    if (!amount) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    try {
      const order = await razorpay.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { plan, email }
      });
        res.json({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: razorpayKeyId
        });
    } catch (err: any) {
      console.error('[Razorpay] Order creation failed:', err);
      res.status(500).json({ error: err.message || "Failed to create order" });
    }
  });

  app.post("/api/payment/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, email } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const user = users.find(u => u.email === email);
      if (user) {
        if (plan === 'Pro') user.credits = 10000;
        else if (plan === 'Ultra') user.credits = 999999;
        user.plan = plan;
      }
      console.log(`[Payment] Verified for ${email}, plan: ${plan}`);
      res.json({ success: true, message: "Payment verified", credits: user?.credits, plan: user?.plan });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  });

  // AI PROXY ENDPOINTS (bypass CORS)
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { prompt, seed, system } = req.body || {};
      if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // 1. Try NVIDIA NIM (Primary Brain)
      const nvidiaText = await generateNvidiaChatText(String(prompt), String(system || ''));
      if (nvidiaText && !nvidiaText.includes("Pollinations")) {
        return res.type('text/plain; charset=utf-8').send(nvidiaText);
      }

      // 2. Try Ollama (Local) Second

      // 2. Try Groq Second
      const groqText = await generateGroqChatText(String(prompt), String(system || ''));
      if (groqText) {
        return res.type('text/plain; charset=utf-8').send(groqText);
      }

      // 3. Fallback to Pollinations
      const chatUrl = `https://text.pollinations.ai/${encodeURIComponent(String(prompt))}?seed=${seed || Math.floor(Math.random() * 0xFFFFFFFF)}&system=${encodeURIComponent(String(system || 'You are a helpful AI assistant.'))}&json=false`;
      const upstream = await fetch(chatUrl, { headers: { 'Accept': 'text/plain' } });

      if (!upstream.ok) {
        const fallbackText = await generateGeminiChatText(String(prompt), String(system || ''));
        if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
        return res.status(upstream.status).send('Chat generation failed');
      }

      const text = await upstream.text();
      res.type('text/plain; charset=utf-8').send(text);
    } catch (err: any) {
      console.error('[Chat Stream Proxy] Error:', err);
      const fallbackText = await generateGeminiChatText(String(req.body?.prompt || ''), String(req.body?.system || ''));
      if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
      res.status(500).json({ error: "Chat stream proxy failed" });
    }
  });

  app.get("/api/chat", async (req, res) => {
    try {
      const { prompt, system } = req.query;
      
      // 1. Try NVIDIA NIM (New Primary for Main Chat)
      const nvidiaText = await generateNvidiaChatText(String(prompt), String(system || ''));
      if (nvidiaText && !nvidiaText.includes("Pollinations")) {
        return res.type('text/plain; charset=utf-8').send(nvidiaText);
      }

      // 2. Fallback to Pollinations
      const url = `https://text.pollinations.ai/${encodeURIComponent(String(prompt))}?system=${encodeURIComponent(String(system))}`;
      const response = await fetch(url);
      const text = await response.text();
      res.setHeader('Content-Type', 'text/plain').send(text);
    } catch (err: any) {
      const fallbackText = await generateGeminiChatText(String(req.query?.prompt || ''), String(req.query?.system || ''));
      if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
      res.status(500).json({ error: "Chat relay failed" });
    }
  });

  app.get("/api/image", async (req, res) => {
    try {
      const prompt = String(req.query.prompt || '').trim();
      const width = String(req.query.width || '768');
      const height = String(req.query.height || '768');
      const seed = String(req.query.seed || Math.floor(Math.random() * 999999));
      const model = String(req.query.model || 'flux');

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
      const response = await fetch(imageUrl);

      if (!response.ok) {
        const geminiImage = await generateGeminiImage(prompt, Number(width), Number(height), Number(seed));
        if (geminiImage) {
          res.setHeader('Content-Type', geminiImage.mimeType || 'image/png');
          return res.send(geminiImage.buffer);
        }
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
      res.send(buffer);
    } catch (err: any) {
      return res.status(500).json({ error: 'Image proxy failed' });
    }
  });

  app.post("/api/voice/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file || !groqApiKey) {
        return res.status(400).json({ error: "Missing file or API key" });
      }

      const blob = new Blob([req.file.buffer], { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('file', blob, 'voice.webm');
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqApiKey}` },
        body: formData
      });

      const data: any = await response.json();
      res.json({ text: data.text || "" });
    } catch (err) {
      console.error('[Whisper] Error:', err);
      res.status(500).json({ error: "Transcription failed" });
    }
  });

  // 5. ERROR HANDLING
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${err.stack}`);
    res.status(500).json({ error: "Internal server error" });
  });

  // 6. VITE MIDDLEWARE INTEGRATION
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else if (options.serveStatic !== false) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}

if (!process.env.VERCEL) {
  createApp().then(app => {
    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`SmartAI Pro Server running on http://localhost:${PORT}`);
    });
  }).catch(err => console.error("Failed to start server:", err));
}
