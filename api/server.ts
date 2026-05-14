import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

// In-memory user storage
const users: any[] = [];
const currentUser: any = null;

export async function createApp(options: { serveStatic?: boolean } = {}) {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_SheglkgbIFBx3Q';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '12EgvmXHWf4djX7CGtH3iNuV';
  const genAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

  app.use(cors());
  app.use(express.json());

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateOllamaStream = async (prompt: string, system: string, res: express.Response) => {
    const models = ['qwen2.5-coder:latest', 'qwen2.5-coder:7b', 'mistral:latest'];
    for (const model of models) {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt: `System: ${system}\n\nUser: ${prompt}`,
            stream: true,
            options: { temperature: 0.7, top_p: 0.9 }
          })
        });

        if (!response.ok) throw new Error(`Ollama ${model} error: ${response.status}`);
        if (!response.body) throw new Error(`Ollama ${model} body null`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-AI-Source', `Ollama (${model})`);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) res.write(json.response);
              if (json.done) break;
            } catch { }
          }
        }
        res.end();
        return true;
      } catch (err: any) {
        console.warn(`[Ollama] Failed with ${model}: ${err.message}`);
        continue;
      }
    }
    return false;
  };

  const generateGeminiChatText = async (prompt: string, system?: string) => {
    if (!genAI) return null;
    const modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    const fullPrompt = `${system?.trim() ? `System: ${system.trim()}\n\n` : ''}${prompt}`;
    for (const model of modelCandidates) {
      try {
        const response: any = await genAI.models.generateContent({ model, contents: fullPrompt });
        const text = (response?.text || '').trim();
        if (text) return text;
      } catch { continue; }
    }
    return null;
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
    const modelCandidates = ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001', 'imagen-4.0-generate-preview-06-06'];
    for (const model of modelCandidates) {
      try {
        const response: any = await genAI.models.generateImages({
          model, prompt,
          config: { numberOfImages: 1, aspectRatio, outputMimeType: 'image/png', seed }
        });
        const image = response?.generatedImages?.[0]?.image;
        const base64 = image?.imageBytes || image?.data;
        const mimeType = image?.mimeType || image?.mime_type || 'image/png';
        if (!base64) continue;
        const buffer = Buffer.from(base64, 'base64');
        if (!buffer.length) continue;
        return { buffer, mimeType };
      } catch { continue; }
    }
    return null;
  };

  const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    const newUser = { id: Date.now(), email, password, credits: 100, plan: 'Basic', history: [] };
    users.push(newUser);
    res.json({ message: "Signup successful", user: { id: newUser.id, email: newUser.email, credits: newUser.credits } });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful", user: { id: user.id, email: user.email, credits: user.credits || 100, plan: user.plan || 'Basic', history: user.history || [] } });
  });

  app.get("/api/auth/me", (req, res) => {
    res.json({ user: users.length > 0 ? { id: users[0].id, email: users[0].email } : null });
  });

  app.post("/api/payment/create-order", async (req, res) => {
    const { plan, email } = req.body;
    if (!plan || !email) return res.status(400).json({ error: "Plan and email are required" });
    const amountMap: Record<string, number> = { 'Creative Mode': 9900, 'Expert Mode': 19900 };
    const amount = amountMap[plan];
    if (!amount) return res.status(400).json({ error: `Invalid plan selected: ${plan}. Available: Creative Mode, Expert Mode` });
    try {
      const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `receipt_${Date.now()}`, notes: { plan, email } });
      res.json({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: razorpayKeyId });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create order" });
    }
  });

  app.post("/api/payment/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, email } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing payment details" });
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', razorpayKeySecret).update(body).digest('hex');
    if (expectedSignature === razorpay_signature) {
      let user = users.find(u => u.email === email);
      if (!user) {
        user = { id: Date.now(), email, credits: 0, plan: 'Normal Mode', history: [] };
        users.push(user);
      }
      if (plan === 'Creative Mode') user.credits = 10000;
      else if (plan === 'Expert Mode') user.credits = 999999;
      user.plan = plan;
      res.json({ success: true, message: "Payment verified", credits: user?.credits, plan: user?.plan });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  });

  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { prompt, seed, system } = req.body || {};
      if (!prompt || !String(prompt).trim()) return res.status(400).json({ error: "Prompt is required" });

      // 1. Try Ollama First (Local)
      const ollamaSuccess = await generateOllamaStream(String(prompt), String(system || ''), res);
      if (ollamaSuccess) return;

      // 2. Cloud Fallback (Pollinations OpenAI)
      const chatUrl = `https://text.pollinations.ai/${encodeURIComponent(String(prompt))}?seed=${seed || Math.floor(Math.random() * 0xFFFFFFFF)}&system=${encodeURIComponent(String(system || 'You are a helpful AI assistant.'))}&model=openai&json=false`;
      const upstream = await fetch(chatUrl, { headers: { 'Accept': 'text/plain' } });
      if (!upstream.ok) {
        const fallbackText = await generateGeminiChatText(String(prompt), String(system || ''));
        if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
        return res.status(upstream.status).send(await upstream.text() || 'Chat generation failed');
      }
      if (!upstream.body) return res.type('text/plain').send(await upstream.text());
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-AI-Source', 'Cloud (OpenAI)');
      
      const reader = upstream.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) res.write(Buffer.from(value));
      }
      res.end();
    } catch (err: any) {
      const fallbackText = await generateGeminiChatText(String(req.body?.prompt || ''), String(req.body?.system || ''));
      if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
      res.status(500).json({ error: err.message || "Chat stream proxy failed" });
    }
  });

  app.get("/api/chat", async (req, res) => {
    try {
      const { prompt, seed, system, json } = req.query;
      const promptStr = String(prompt || '');
      const systemStr = String(system || '');

      // 1. Try Ollama (Non-streaming)
      const models = ['qwen2.5-coder:latest', 'qwen2.5-coder:7b', 'mistral:latest'];
      for (const model of models) {
        try {
          const ollamaRes = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt: `System: ${systemStr}\n\nUser: ${promptStr}`, stream: false })
          });
          if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            if (data.response) {
              res.setHeader('X-AI-Source', `Ollama (${model})`);
              return res.send(data.response);
            }
          }
        } catch { continue; }
      }

      // 2. Cloud Fallback
      const url = `https://text.pollinations.ai/${encodeURIComponent(promptStr)}?seed=${seed}&system=${encodeURIComponent(systemStr)}&model=openai&json=${json}`;
      const response = await fetch(url);
      if (!response.ok) {
        const fallbackText = await generateGeminiChatText(String(prompt || ''), String(system || ''));
        if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
      }
      res.setHeader('Content-Type', 'text/plain');
      res.send(await response.text());
    } catch (err: any) {
      const fallbackText = await generateGeminiChatText(String(req.query?.prompt || ''), String(req.query?.system || ''));
      if (fallbackText) return res.type('text/plain; charset=utf-8').send(fallbackText);
      res.status(500).json({ error: err.message || "Chat proxy failed" });
    }
  });

  app.get("/api/image", async (req, res) => {
    try {
      const prompt = String(req.query.prompt || '').trim();
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
      const width = String(req.query.width || '768');
      const height = String(req.query.height || '768');
      const seed = String(req.query.seed || Math.floor(Math.random() * 999999));
      const model = String(req.query.model || 'flux-realism');
      const commonParams = new URLSearchParams({ width, height, seed, model, nologo: 'true', enhance: 'true' });
      const candidates = [
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${commonParams.toString()}&quality=100`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`,
        `https://image.pollinations.ai/generate?prompt=${encodeURIComponent(prompt)}&width=${width}&height=${height}&seed=${seed}&model=flux-pro`
      ];
      for (const imageUrl of candidates) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await fetch(imageUrl, { headers: { 'Accept': 'image/*', 'User-Agent': 'Mozilla/5.0 SmartAIPro/1.0' } });
            if (!response.ok) {
              if (response.status === 429) await sleep(800 + attempt * 500);
              continue;
            }
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            if (!contentType.includes('image')) continue;
            const buffer = Buffer.from(await response.arrayBuffer());
            if (!buffer.length) continue;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'no-store');
            return res.send(buffer);
          } catch { continue; }
        }
      }
      const geminiImage = await generateGeminiImage(prompt, Number(width), Number(height), Number(seed));
      if (geminiImage) {
        res.setHeader('Content-Type', geminiImage.mimeType || 'image/png');
        res.setHeader('Cache-Control', 'no-store');
        return res.send(geminiImage.buffer);
      }
      return res.status(502).json({ error: 'All image providers failed. Please try another prompt.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Image proxy failed' });
    }
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${err.stack}`);
    res.status(500).json({ error: "Internal server error" });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else if (options.serveStatic !== false) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }

  return app;
}

if (!process.env.VERCEL) {
  createApp().then(app => {
    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, "0.0.0.0", () => { console.log(`SmartAI Pro Server running on http://localhost:${PORT}`); });
  }).catch(err => { console.error("Failed to start server:", err); });
}
