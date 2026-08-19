import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined or is placeholder. Falling back to mock response.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API:", error);
}

// Simulated Database State (In-Memory for SaaS demo to be robust & fast)
// Multi-tenant configuration
let saaSConfig = {
  activeTenantId: "donomar",
  tenants: {
    donomar: {
      id: "donomar",
      name: "Don Omar Rotisería",
      city: "San Benito, Entre Ríos, Argentina",
      address: "Av. Friuli y Garay",
      phone: "+54 343 555-1234",
      primaryColor: "#FF7A00", // Naranja Don Omar
      secondaryColor: "#111111",
      logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      deliveryFee: 800,
      estimatedPreparationMin: "20-30",
      estimatedDeliveryMin: "15-25",
    },
    pizzaloop: {
      id: "pizzaloop",
      name: "Pizza Loop",
      city: "Paraná, Entre Ríos, Argentina",
      address: "Peatonal San Martín 850",
      phone: "+54 343 555-9876",
      primaryColor: "#E53E3E", // Rojo
      secondaryColor: "#1A202C",
      logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      deliveryFee: 1200,
      estimatedPreparationMin: "15-25",
      estimatedDeliveryMin: "20-30",
    }
  }
};

// Webhook log to display in Admin dashboard
let webhookLogs: Array<{
  id: string;
  timestamp: string;
  event: string;
  payload: any;
  status: string;
}> = [];

function triggerWebhook(event: string, payload: any) {
  const logEntry = {
    id: "wh_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    event,
    payload,
    status: "success_200"
  };
  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 50) webhookLogs.pop();
  console.log(`[Webhook Triggered] Event: ${event}`, payload);
}

// API Routes
app.get("/api/tenant-config", (req, res) => {
  res.json({
    activeTenant: saaSConfig.tenants[saaSConfig.activeTenantId as keyof typeof saaSConfig.tenants],
    allTenants: saaSConfig.tenants
  });
});

app.post("/api/tenant-config/switch", (req, res) => {
  const { tenantId } = req.body;
  if (saaSConfig.tenants[tenantId as keyof typeof saaSConfig.tenants]) {
    saaSConfig.activeTenantId = tenantId;
    triggerWebhook("tenant_switched", { tenantId });
    res.json({ success: true, activeTenant: saaSConfig.tenants[tenantId as keyof typeof saaSConfig.tenants] });
  } else {
    res.status(400).json({ error: "Tenant not found" });
  }
});

app.post("/api/tenant-config/update", (req, res) => {
  const { tenantId, configUpdates } = req.body;
  if (saaSConfig.tenants[tenantId as keyof typeof saaSConfig.tenants]) {
    saaSConfig.tenants[tenantId as keyof typeof saaSConfig.tenants] = {
      ...saaSConfig.tenants[tenantId as keyof typeof saaSConfig.tenants],
      ...configUpdates
    };
    triggerWebhook("tenant_updated", { tenantId, configUpdates });
    res.json({ success: true, tenant: saaSConfig.tenants[tenantId as keyof typeof saaSConfig.tenants] });
  } else {
    res.status(400).json({ error: "Tenant not found" });
  }
});

app.get("/api/webhooks/logs", (req, res) => {
  res.json({ logs: webhookLogs });
});

// Trigger order webhooks externally
app.post("/api/webhooks/trigger", (req, res) => {
  const { event, payload } = req.body;
  triggerWebhook(event, payload);
  res.json({ success: true });
});

// AI Copilot route powered by Gemini
app.post("/api/ai/chat", async (req, res) => {
  const { message, history } = req.body;
  
  const systemPrompt = `Eres "Omarcito AI", el asistente inteligente oficial de la rotisería "Don Omar" ubicada en San Benito, Entre Ríos.
Tu personalidad es cálida, entrerriana (puedes usar un sutil y simpático tono local sin exagerar, amigable, servicial), apasionado por la comida casera abundante, rica y económica de Don Omar.
El menú actual incluye:
- Pizzas (Especial: $11500, Muzza: $9500, Fugazzeta: $10500)
- Empanadas (Carne suave, Jamón y Queso, Pollo: $1200 c/u, Docena: $12500)
- Hamburguesas (Don Omar XL con papas fritas: $8900, Simple con queso: $6500)
- Lomito Completo Don Omar (Carne tierna, jamón, queso, lechuga, tomate, huevo frito, aderezos y papas fritas abundantes: $10500)
- Milanesa Napolitana gigante con papas para compartir ($13900)
- Pastas caseras (Tallarines o Ñoquis con tuco o estofado de carne: $7800)
- Postres (Flan casero con dulce de leche: $3200, Vigilante dulce: $2800)

Políticas de Envío:
- Envío dentro de San Benito: $800.
- Envío a Paraná (zonas aledañas): $1500.
- Tiempos promedio: Preparación 20-30 minutos, entrega 15-25 minutos.
- Métodos de pago: Mercado Pago, Transferencia Bancaria (con carga de comprobante en la web), Efectivo al recibir, o Tarjeta de débito/crédito.

Por favor, ayuda al cliente a armar su pedido, sugiere promociones (ej. "La promo de Lomito con Bebida de regalo por $11500" o "La docena de empanadas con una cerveza gratis"), responde con empatía y calidez. Responde siempre en formato markdown corto, legible y muy visual, usando emojis de comida.
Si el usuario pregunta por el estado de su pedido, dile amablemente que puede consultarlo en la sección "Seguimiento en Tiempo Real" ingresando su ID de pedido.
Manten tus respuestas breves y enfocadas en tentar al cliente con la comida de Don Omar.`;

  if (ai) {
    try {
      // Add conversational history if exists
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text || "" }]
          });
        });
      }

      // Add active user message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction: systemPrompt
        }
      });

      const aiResponseText = response.text || "¡Hola! Estoy experimentando una alta demanda, pero contame, ¿te tienta una buena milanesa o unas empanadas de carne cortada a cuchillo?";
      res.json({ text: aiResponseText });
    } catch (error) {
      console.error("Gemini API execution failed, returning high-quality mock response:", error);
      res.json({ text: getMockAiResponse(message) });
    }
  } else {
    // Elegant fallback mock responder
    setTimeout(() => {
      res.json({ text: getMockAiResponse(message) });
    }, 800);
  }
});

function getMockAiResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("hola") || m.includes("buenas")) {
    return `¡Hola, chamigo! Bienvenido a **Don Omar**. 🍊🍔
Aquí cocinamos abundante, rico y re barato para toda la gurisada de San Benito. 

¿Qué te anda tentando hoy? Te ultra recomiendo:
*   🍔 **Lomito Completo Don Omar**: Viene con papas fritas que rebalsan la bandeja ($10500).
*   🍕 **Pizza Especial**: Salsa casera, jamón, morrón y una muzzarella espectacular ($11500).
*   🥟 **Empanadas Criollas**: La docena para compartir ($12500).

¡Decime qué querés y te lo agrego al carrito!`;
  }
  if (m.includes("lomito") || m.includes("lomo")) {
    return `¡Ufff, el **Lomito Completo** de Don Omar es patrimonio de San Benito! 🥩🔥
Lleva pan casero calentito, bife de lomo súper tierno, queso derretido, jamón, huevo frito, lechuga, tomate y una montaña de papas fritas. 

Sale por solo **$10.500** y comen dos tranqui si no tienen tanto hambre. ¿Querés que te sume uno para esta noche? 😉`;
  }
  if (m.includes("empanada") || m.includes("empanadas")) {
    return `¡Las empanadas de Don Omar son una locura! 🥟✨
Tienen relleno bien casero y abundante. Vienen de:
*   🥩 Carne cortada a cuchillo (suave o picante)
*   🧀 Jamón y Queso súper cremosas
*   🐔 Pollo al verdeo

Cada una cuesta **$1.200**, pero la docena te queda en **$12.500** y te regalamos una empanada extra de yapa. ¿De qué sabores te andaría gustando?`;
  }
  if (m.includes("pizza") || m.includes("pizzas")) {
    return `¡Salen pizzas doradas a la piedra! 🍕🔥
Las más pedidas por los vecinos son:
*   🧀 **Muzzarella**: Mucho queso y orégano de la huerta ($9500).
*   🍅 **Especial**: Muzza, jamón, morrones asados y aceitunas ($11500).
*   🧅 **Fugazzeta**: Montaña de cebolla caramelizada y queso ($10500).

¿Surgió pizza hoy con la familia? Contame cuál te preparo.`;
  }
  if (m.includes("pago") || m.includes("pagar") || m.includes("mercado") || m.includes("transferencia")) {
    return `¡Súper fácil! Podés pagar como te quede más cómodo:
1.  💵 **Efectivo** al recibir.
2.  💳 **Mercado Pago** online o QR al cadete.
3.  🏦 **Transferencia bancaria** (en el checkout subís la captura de pantalla del comprobante y en cocina te lo aprobamos al toque).

¡Cero complicaciones para disfrutar la cena!`;
  }
  return `¡Me parece una idea genial! 🍊 En **Don Omar** preparamos todo en el momento para que te llegue calentito. 

Te comento que si hacés el pedido ahora, el cadete tarda aproximadamente **30-45 minutos** en llegar a tu puerta en San Benito.

¿Te tienta agregar algo más? ¿Una empanada frita de entrada o una gaseosa bien fría? 🥤🍟`;
}

// Vite Server Setup for Dev/Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartFood Don Omar Server listening on http://localhost:${PORT}`);
  });
}

startServer();
