import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Clock,
  MapPin,
  Utensils,
  Plus,
  Minus,
  Trash2,
  Phone,
  MessageSquare,
  Search,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Package,
  Users,
  Percent,
  Activity,
  CheckCircle,
  Truck,
  Send,
  Upload,
  User,
  Settings,
  Bell,
  Check,
  AlertCircle,
  FileText,
  Map,
  Sparkles,
  RefreshCw,
  Eye,
  Layers,
  Database
} from "lucide-react";
import { INITIAL_PRODUCTS, INITIAL_PROMOTIONS, INITIAL_RIDERS, BARRIOS_SAN_BENITO } from "./data";
import { Product, CartItem, Order, OrderStatus, Rider, Promotion, TenantConfig } from "./types";
import { supabase } from "./lib/supabase";

// Setup Mock Client Sync with LocalStorage to prevent loss of state between reloads
export default function App() {
  // SaaS Multi-tenant configurations
  const [tenant, setTenant] = useState<TenantConfig>({
    id: "donomar",
    name: "Don Omar Rotisería",
    city: "San Benito, Entre Ríos, Argentina",
    address: "Av. Friuli y Garay",
    phone: "+54 343 555-1234",
    primaryColor: "#FF7A00",
    secondaryColor: "#111111",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=60",
    deliveryFee: 800,
    estimatedPreparationMin: "20-30",
    estimatedDeliveryMin: "15-25",
  });

  const [allTenants, setAllTenants] = useState<{ [key: string]: TenantConfig }>({
    donomar: {
      id: "donomar",
      name: "Don Omar Rotisería",
      city: "San Benito, Entre Ríos, Argentina",
      address: "Av. Friuli y Garay",
      phone: "+54 343 555-1234",
      primaryColor: "#FF7A00",
      secondaryColor: "#111111",
      logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=60",
      deliveryFee: 800,
      estimatedPreparationMin: "20-30",
      estimatedDeliveryMin: "15-25",
    },
    pizzaloop: {
      id: "pizzaloop",
      name: "Pizza Loop Express",
      city: "Paraná, Entre Ríos, Argentina",
      address: "Peatonal San Martín 850",
      phone: "+54 343 555-9876",
      primaryColor: "#E53E3E",
      secondaryColor: "#1A202C",
      logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60",
      deliveryFee: 1200,
      estimatedPreparationMin: "15-25",
      estimatedDeliveryMin: "20-30",
    }
  });

  // State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("donomar_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error parsing stored products", e);
    }
    return INITIAL_PRODUCTS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    try {
      const saved = localStorage.getItem("donomar_promotions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error parsing stored promotions", e);
    }
    return INITIAL_PROMOTIONS;
  });

  const [riders, setRiders] = useState<Rider[]>(() => {
    try {
      const saved = localStorage.getItem("donomar_riders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error parsing stored riders", e);
    }
    return INITIAL_RIDERS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");

  // Checkout inputs
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutBarrio, setCheckoutBarrio] = useState(BARRIOS_SAN_BENITO[0].name);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mercado_pago" | "transferencia" | "efectivo" | "tarjeta">("mercado_pago");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  // App views: "client" | "kitchen" | "rider" | "admin"
  const [activeTab, setActiveTab] = useState<"client" | "kitchen" | "rider" | "admin">("client");

  // Orders list
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("donomar_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error parsing stored orders", e);
    }

    // Initial demo order
    return [
      {
        id: "DO-1024",
        tenantId: "donomar",
        customerName: "Rodrigo Frison",
        customerPhone: "+54 343 555-8812",
        customerEmail: "rodrigofrison88@gmail.com",
        address: "Av. Friuli 1420",
        barrio: "San Benito Centro",
        notes: "Por favor que las papas fritas estén bien crujientes.",
        paymentMethod: "transferencia",
        paymentScreenshot: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=40",
        items: [
          {
            product: INITIAL_PRODUCTS[5] || INITIAL_PRODUCTS[0], // Lomito Completo
            quantity: 1,
            notes: "Con abundante mayonesa casera"
          },
          {
            product: INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0], // Empanada Carne
            quantity: 6,
            notes: "Fritas si es posible"
          }
        ],
        subtotal: 17700,
        shippingFee: 800,
        discount: 1500,
        total: 17000,
        status: "en_camino",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        preparationETA: 20,
        deliveryETA: 15,
        riderId: "cadete1",
        gpsLocation: {
          lat: -31.7825,
          lng: -60.4340
        }
      }
    ];
  });

  // Track the user's placed order ID
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>("DO-1024");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Webhook integration events logs
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // AI Assistant Panel State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "¡Hola gurises! Soy **Omarcito AI**, tu asistente cebador de pedidos de **Don Omar**. 🍊🍔 ¿Qué te andaría tentando hoy? Te puedo recomendar nuestros famosos lomitos, empanadas cortadas a cuchillo o cargarte algo al carrito."
    }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem("donomar_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("donomar_promotions", JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem("donomar_riders", JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem("donomar_orders", JSON.stringify(orders));
  }, [orders]);

  // Fetch tenant settings and webhook logs from Node Backend
  const fetchBackendData = async () => {
    try {
      const resLogs = await fetch("/api/webhooks/logs");
      if (resLogs.ok) {
        const data = await resLogs.json();
        setWebhookLogs(data.logs || []);
      }
    } catch (e) {
      console.warn("Backend unavailable, using simulated logs");
    }
  };

  const [supabaseLoading, setSupabaseLoading] = useState(false);

  // Live synchronization directly with Supabase
  const syncFromSupabase = async (silent = false) => {
    if (!silent) setSupabaseLoading(true);
    try {
      // 1. Fetch configuracion (Tenant settings)
      const { data: configData, error: configErr } = await supabase
        .from("configuracion")
        .select("*")
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (configData && !configErr) {
        setTenant({
          id: configData.tenant_id,
          name: configData.name,
          city: configData.city,
          address: configData.address,
          phone: configData.phone,
          primaryColor: configData.primary_color || "#FF7A00",
          secondaryColor: configData.secondary_color || "#111111",
          logo: configData.logo_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=60",
          deliveryFee: Number(configData.delivery_fee) || 800,
          estimatedPreparationMin: configData.estimated_preparation_min || "20-30",
          estimatedDeliveryMin: configData.estimated_delivery_min || "15-25",
        });
      }

      // 1.5 Fetch categories map
      const { data: catData } = await supabase
        .from("categorias")
        .select("id, name")
        .eq("tenant_id", tenant.id);
      
      const categoryMap: { [id: number]: string } = {};
      if (catData) {
        catData.forEach((c: any) => { categoryMap[c.id] = c.name; });
      }

      // 2. Fetch products
      let prodList: any[] = [];
      const { data: prodData, error: prodErr } = await supabase
        .from("productos")
        .select(`
          id,
          tenant_id,
          category_id,
          name,
          description,
          ingredients,
          price,
          discount_price,
          image_url,
          available,
          preparation_time_min,
          tags,
          categorias ( id, name )
        `)
        .eq("tenant_id", tenant.id);

      if (!prodErr && prodData && prodData.length > 0) {
        prodList = prodData;
      } else {
        const { data: simpleProdData } = await supabase
          .from("productos")
          .select("*")
          .eq("tenant_id", tenant.id);
        if (simpleProdData && simpleProdData.length > 0) {
          prodList = simpleProdData;
        }
      }

      if (prodList && prodList.length > 0) {
        const mappedProducts = prodList.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
          price: Number(p.price),
          discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
          category: (p.categorias?.name || (p.category_id ? categoryMap[p.category_id] : null) || "Otros") as any,
          image: p.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=60",
          available: p.available !== false,
          preparationTimeMin: p.preparation_time_min || 20,
          tags: Array.isArray(p.tags) ? p.tags : []
        }));
        setProducts(mappedProducts);
      }

      // 3. Fetch promotions
      const { data: promoData, error: promoErr } = await supabase
        .from("promociones")
        .select("*")
        .eq("tenant_id", tenant.id);

      if (promoData && promoData.length > 0 && !promoErr) {
        const mappedPromos = promoData.map((pr: any) => ({
          id: pr.id,
          title: pr.title,
          description: pr.description || "",
          discountPercentage: Number(pr.discount_percentage),
          couponCode: pr.coupon_code || undefined,
          bannerImage: pr.banner_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60",
          expiryDate: pr.expiry_date || ""
        }));
        setPromotions(mappedPromos);
      }

      // 4. Fetch riders
      const { data: riderData, error: riderErr } = await supabase
        .from("cadetes")
        .select("*")
        .eq("tenant_id", tenant.id);

      if (riderData && riderData.length > 0 && !riderErr) {
        const mappedRiders = riderData.map((r: any) => ({
          id: r.id,
          name: r.name,
          avatar: r.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
          phone: r.phone,
          status: (r.status || "disponible") as any,
          currentLocation: {
            lat: -31.7825,
            lng: -60.4340,
            street: "Av. Friuli"
          }
        }));
        setRiders(mappedRiders);
      }

      // 5. Fetch orders
      const { data: orderData, error: orderErr } = await supabase
        .from("pedidos")
        .select(`
          id,
          tenant_id,
          customer_name,
          customer_phone,
          customer_email,
          address,
          barrio,
          notes,
          payment_method,
          payment_screenshot_url,
          subtotal,
          shipping_fee,
          discount,
          total,
          status,
          rider_id,
          coupon_code,
          gps_lat,
          gps_lng,
          created_at,
          detalle_pedido (
            id,
            product_id,
            quantity,
            price,
            notes,
            productos (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (orderData && orderData.length > 0 && !orderErr) {
        const mappedOrders = orderData.map((o: any) => {
          const items = (o.detalle_pedido || []).map((d: any) => ({
            product: {
              id: d.product_id,
              name: d.productos?.name || "Producto de Catálogo",
              description: "",
              ingredients: [],
              price: Number(d.price),
              category: "Otros",
              image: d.productos?.image_url || "",
              available: true,
              preparationTimeMin: 20,
              tags: []
            },
            quantity: d.quantity,
            notes: d.notes || ""
          }));

          return {
            id: o.id,
            tenantId: o.tenant_id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerEmail: o.customer_email,
            address: o.address,
            barrio: o.barrio,
            notes: o.notes || "",
            paymentMethod: o.payment_method as any,
            paymentScreenshot: o.payment_screenshot_url || undefined,
            items,
            subtotal: Number(o.subtotal),
            shippingFee: Number(o.shipping_fee),
            discount: Number(o.discount),
            total: Number(o.total),
            status: o.status as any,
            createdAt: o.created_at,
            riderId: o.rider_id || undefined,
            couponCode: o.coupon_code || undefined,
            gpsLocation: o.gps_lat && o.gps_lng ? { lat: Number(o.gps_lat), lng: Number(o.gps_lng) } : undefined
          };
        });
        setOrders(mappedOrders);
      }

      if (!silent) showToast("¡Sincronizado con Supabase!", "success");
    } catch (e) {
      console.warn("Supabase sync completed with offline cache fallback:", e);
    } finally {
      if (!silent) setSupabaseLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch from backend + live Supabase synchronization
    fetchBackendData();
    syncFromSupabase(true);

    const interval = setInterval(() => {
      fetchBackendData();
      syncFromSupabase(true); // silent auto-refresh
    }, 8000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  // Trigger simulated/real Webhook on Backend
  const triggerN8NWebhook = async (event: string, payload: any) => {
    const timestamp = new Date().toISOString();
    const logId = "wh_" + Math.random().toString(36).substr(2, 9);
    const newLog = {
      id: logId,
      timestamp,
      event,
      payload,
      status: "success_200"
    };

    setWebhookLogs(prev => [newLog, ...prev]);

    try {
      await fetch("/api/webhooks/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, payload })
      });
    } catch (e) {
      console.warn("Could not post to server webhook route, saved locally.");
    }
  };

  // Helper function for user notification toast
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Switch Multi-tenant configurations
  const handleTenantSwitch = (tenantId: string) => {
    const selected = allTenants[tenantId];
    if (selected) {
      setTenant(selected);
      showToast(`Cambiando de local a: ${selected.name}`, "info");
      triggerN8NWebhook("tenant_switched", { tenantId, name: selected.name });
    }
  };

  // Add Product to Cart
  const handleAddToCart = (product: Product, notes: string = "") => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.notes === notes);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.notes === notes
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, notes }];
    });
    showToast(`Se agregó ${product.name} al carrito!`);
  };

  const handleUpdateQuantity = (productId: string, notes: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.notes === notes) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string, notes: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.notes === notes)));
    showToast("Producto removido del carrito.");
  };

  // Apply Discount Coupon
  const handleApplyCoupon = () => {
    const promo = promotions.find(p => p.couponCode?.toUpperCase() === couponCode.trim().toUpperCase());
    if (promo) {
      setCouponDiscount(promo.discountPercentage);
      setCouponApplied(promo.couponCode || "");
      showToast(`¡Cupón ${promo.couponCode} aplicado! Descuento del ${promo.discountPercentage}%`);
    } else {
      showToast("Cupón inválido o vencido.", "info");
    }
  };

  // File Uploader Handler for bank receipts
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        showToast("¡Comprobante cargado correctamente!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Order / Checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Tu carrito está vacío", "info");
      return;
    }
    if (!checkoutName || !checkoutPhone || !checkoutEmail || !checkoutAddress) {
      showToast("Por favor completa los datos obligatorios", "info");
      return;
    }

    const selectedBarrioInfo = BARRIOS_SAN_BENITO.find(b => b.name === checkoutBarrio);
    const barrioExtra = selectedBarrioInfo ? selectedBarrioInfo.extraFee : 0;
    const shippingFee = tenant.deliveryFee + barrioExtra;

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discount = Math.round(subtotal * (couponDiscount / 100));
    const total = subtotal + shippingFee - discount;

    const newOrderId = `DO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: newOrderId,
      tenantId: tenant.id,
      customerName: checkoutName,
      customerPhone: checkoutPhone,
      customerEmail: checkoutEmail,
      address: checkoutAddress,
      barrio: checkoutBarrio,
      notes: checkoutNotes,
      paymentMethod,
      paymentScreenshot: screenshotPreview || undefined,
      items: [...cart],
      subtotal,
      shippingFee,
      discount,
      total,
      status: paymentMethod === "transferencia" ? "pago_pendiente" : "recibido",
      createdAt: new Date().toISOString(),
      preparationETA: parseInt(tenant.estimatedPreparationMin),
      deliveryETA: parseInt(tenant.estimatedDeliveryMin),
      gpsLocation: {
        lat: -31.7800 + (Math.random() - 0.5) * 0.01,
        lng: -60.4300 + (Math.random() - 0.5) * 0.01,
      }
    };

    setOrders(prev => [newOrder, ...prev]);
    setTrackingOrderId(newOrderId);
    setCart([]);
    setScreenshotPreview(null);
    setCouponDiscount(0);
    setCouponApplied("");

    showToast(`¡Pedido ${newOrderId} recibido con éxito!`);
    
    // Save Order and Detail to Supabase in real-time
    const pushOrderToSupabase = async () => {
      try {
        const { error: orderErr } = await supabase.from("pedidos").insert({
          id: newOrderId,
          tenant_id: tenant.id,
          customer_name: checkoutName,
          customer_phone: checkoutPhone,
          customer_email: checkoutEmail,
          address: checkoutAddress,
          barrio: checkoutBarrio,
          notes: checkoutNotes,
          payment_method: paymentMethod,
          payment_screenshot_url: screenshotPreview || null,
          subtotal: subtotal,
          shipping_fee: shippingFee,
          discount: discount,
          total: total,
          status: paymentMethod === "transferencia" ? "pago_pendiente" : "recibido",
          gps_lat: newOrder.gpsLocation?.lat || null,
          gps_lng: newOrder.gpsLocation?.lng || null
        });

        if (orderErr) throw orderErr;

        // Insert order details
        const detailsToInsert = cart.map(item => ({
          order_id: newOrderId,
          product_id: item.product.id.length === 36 ? item.product.id : undefined, // filter for real UUIDs
          quantity: item.quantity,
          price: item.product.price,
          notes: item.notes || null
        })).filter(detail => detail.product_id !== undefined);

        if (detailsToInsert.length > 0) {
          const { error: detailsErr } = await supabase.from("detalle_pedido").insert(detailsToInsert);
          if (detailsErr) throw detailsErr;
        }
      } catch (e) {
        console.warn("No se pudo guardar el pedido en Supabase (puede requerir seed de productos con UUIDs):", e);
      }
    };
    pushOrderToSupabase();
    
    // Trigger N8N webhooks
    triggerN8NWebhook("order_created", {
      orderId: newOrderId,
      tenant: tenant.name,
      customer: checkoutName,
      total,
      paymentMethod,
      itemsCount: newOrder.items.length
    });
  };

  // Status step progression helper (Admin console / Kitchen console)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        // Log changes
        triggerN8NWebhook("order_status_updated", { orderId, previousStatus: order.status, nextStatus: newStatus });
        
        // Assign rider automatically if it goes to "cadete_asignado" or "en_camino"
        let riderId = order.riderId;
        if (newStatus === "cadete_asignado" && !riderId) {
          const availableRider = riders.find(r => r.status === "disponible");
          if (availableRider) {
            riderId = availableRider.id;
            showToast(`Cadete ${availableRider.name} asignado al pedido ${orderId}`);
          }
        }

        // Push update to Supabase
        const updateSupabaseStatus = async () => {
          try {
            const { error } = await supabase
              .from("pedidos")
              .update({ status: newStatus, rider_id: riderId && riderId.length === 36 ? riderId : null })
              .eq("id", orderId);
            if (error) throw error;
          } catch (e) {
            console.warn("Could not update status in Supabase database:", e);
          }
        };
        updateSupabaseStatus();

        return { ...order, status: newStatus, riderId };
      }
      return order;
    }));
  };

  // AI Omarcito Chat Handler
  const handleSendMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: aiMessages.slice(-5) // Send some history for context
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiMessages(prev => [...prev, { role: "assistant", text: data.text }]);
      } else {
        throw new Error("API call returned non-200");
      }
    } catch (e) {
      // Simulate quick premium fallback in frontend
      setTimeout(() => {
        let reply = "¡Qué tal chamigo! No pude conectar con mi base cerebral temporalmente, pero te aseguro que todo lo que cocina Don Omar está de chuparse los dedos. Decime si querés un lomito completo o una docena de empanadas de carne criolla jugosa.";
        
        const text = userMsg.toLowerCase();
        if (text.includes("lomito") || text.includes("lomo")) {
          reply = "¡La especialidad de la casa! 🍔 El **Lomito Completo Don Omar** sale con papas fritas gigantes por solo **$10500**. ¿Querés que te sume uno al carrito?";
        } else if (text.includes("empanada") || text.includes("empanadas")) {
          reply = "🥟 ¡Nuestras empanadas son gloriosas! Podés pedir de carne suave cortada a cuchillo, jamón y queso, o pollo al verdeo. Cuestan **$1200 c/u** o la docena te queda en **$12500**.";
        } else if (text.includes("pizza") || text.includes("pizzas")) {
          reply = "🍕 Salen pizzas crujientes con muzzarella premium de San Benito. La de muzzarella común está **$9500** y la especial con jamón y morrones asados **$11500**. ¿Probamos una?";
        } else if (text.includes("pago") || text.includes("pagar")) {
          reply = "💵 Podés abonar por Mercado Pago, Efectivo al recibir, o por Transferencia bancaria subiendo el comprobante en la pantalla de checkout.";
        }
        
        setAiMessages(prev => [...prev, { role: "assistant", text: reply }]);
      }, 700);
    } finally {
      setAiLoading(false);
    }
  };

  // Simulating Rider live tracking motion path!
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        let changed = false;
        const updated = prevOrders.map(order => {
          if (order.status === "en_camino" && order.gpsLocation) {
            changed = true;
            // Shift coordinates slightly closer to a center destination point (-31.7800, -60.4300)
            const targetLat = -31.7800;
            const targetLng = -60.4300;
            
            const currentLat = order.gpsLocation.lat;
            const currentLng = order.gpsLocation.lng;
            
            const newLat = currentLat + (targetLat - currentLat) * 0.15;
            const newLng = currentLng + (targetLng - currentLng) * 0.15;

            // Reduce remaining delivery time slowly
            const newETA = order.deliveryETA && order.deliveryETA > 1 ? order.deliveryETA - 1 : 1;

            return {
              ...order,
              deliveryETA: newETA,
              gpsLocation: {
                lat: parseFloat(newLat.toFixed(6)),
                lng: parseFloat(newLng.toFixed(6))
              }
            };
          }
          return order;
        });
        return changed ? updated : prevOrders;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter products by category & search
  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === "Todos" || p.category === selectedCategory;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  const activeTrackingOrder = orders.find(o => o.id === trackingOrderId);
  const activeRider = activeTrackingOrder && activeTrackingOrder.riderId
    ? riders.find(r => r.id === activeTrackingOrder.riderId)
    : riders[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-[#FF7A00] selection:text-black">
      
      {/* Toast notifications */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-zinc-900 border border-[#FF7A00]/50 px-5 py-4 rounded-2xl shadow-2xl animate-bounce shadow-[#FF7A00]/10 max-w-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse"></div>
          <span className="text-sm font-medium text-zinc-100">{notification.message}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md h-16 px-4 md:px-8 border-b border-[#1f1f1f] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#FF7A00] rounded-xl flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-[#FF7A00]/20">DO</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight">{tenant.name}</h1>
              <span className="text-[#FF7A00] font-mono text-[10px] bg-[#FF7A00]/10 px-2 py-0.5 rounded-full border border-[#FF7A00]/20">v1.0</span>
            </div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-[2px] hidden md:block">SaaS Enterprise Platform</p>
          </div>
        </div>

        {/* Console View Switcher buttons */}
        <div className="flex items-center space-x-1 md:space-x-2 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("client")}
            className={`px-2.5 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "client" ? "bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/10" : "text-zinc-400 hover:text-white"
            }`}
          >
            🍔 Menú Cliente
          </button>
          <button
            onClick={() => setActiveTab("kitchen")}
            className={`px-2.5 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === "kitchen" ? "bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/10" : "text-zinc-400 hover:text-white"
            }`}
          >
            🍳 Cocina
            {orders.filter(o => ["recibido", "pago_aprobado", "preparando"].includes(o.status)).length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {orders.filter(o => ["recibido", "pago_aprobado", "preparando"].includes(o.status)).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("rider")}
            className={`px-2.5 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "rider" ? "bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/10" : "text-zinc-400 hover:text-white"
            }`}
          >
            🛵 Cadetes
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-2.5 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "admin" ? "bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/10" : "text-zinc-400 hover:text-white"
            }`}
          >
            📊 SaaS Admin
          </button>
        </div>

        {/* Tenant Customizer & Indicator */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{tenant.city.split(",")[0].toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={tenant.id}
              onChange={(e) => handleTenantSwitch(e.target.value)}
              className="bg-transparent text-xs text-white border-none focus:outline-none font-bold pr-1 cursor-pointer"
            >
              <option value="donomar" className="bg-zinc-950 text-white">Don Omar (San Benito)</option>
              <option value="pizzaloop" className="bg-zinc-950 text-white">Pizza Loop (Paraná)</option>
            </select>
          </div>
        </div>
      </nav>

      {/* CORE DISPLAY */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* =====================================================================
            CLIENT TERMINAL TAB
            ===================================================================== */}
        {activeTab === "client" && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden w-full">
            
            {/* Left side: Categories & Products layout */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
              
              {/* BRAND HERO HEADER */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FF7A00]/20 to-black p-6 md:p-10 border border-zinc-800 shadow-2xl">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-25 md:opacity-45 bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80')] bg-cover bg-center rounded-l-3xl"></div>
                
                <span className="text-[10px] text-[#FF7A00] font-bold tracking-[3px] uppercase">Comida Casera, Rica y Económica</span>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-1 mb-2">
                  La Rotisería de la gurisada de <br/>
                  <span className="text-[#FF7A00] italic font-serif">San Benito</span>
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm max-w-xl leading-relaxed">
                  Porciones gigantescas preparadas en el día por la familia de Don Omar. Reparto súper rápido directo a tu domicilio, barrio privado o quinta en la región.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5 bg-zinc-900/90 px-3 py-2 rounded-xl border border-zinc-800">
                    <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span className="text-zinc-300 font-medium">Prep: <b>{tenant.estimatedPreparationMin} min</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/90 px-3 py-2 rounded-xl border border-zinc-800">
                    <Truck className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span className="text-zinc-300 font-medium">Envío promedio: <b>{tenant.estimatedDeliveryMin} min</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/90 px-3 py-2 rounded-xl border border-zinc-800">
                    <DollarSign className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span className="text-zinc-300 font-medium">Costo de Envío: <b>${tenant.deliveryFee}</b></span>
                  </div>
                </div>
              </div>

              {/* SEARCH & PROMO BANNER CAROUSEL */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscá empanadas, lomitos, pizzas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium placeholder-zinc-500 text-white focus:outline-none focus:border-[#FF7A00] transition-all"
                  />
                </div>

                {/* Category tags horizontal scroller */}
                <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                  {["Todos", "Pizzas", "Empanadas", "Hamburguesas", "Lomitos", "Pastas", "Postres", "Promociones"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-[#FF7A00] text-black"
                          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {cat === "Todos" ? "🍔 Todo" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* PROMOTIONS DISPLAY */}
              {selectedCategory === "Todos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-5 flex flex-col md:flex-row gap-4 hover:border-[#FF7A00]/40 transition-all cursor-pointer"
                    >
                      <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-zinc-800 relative">
                        <img
                          src={promo.bannerImage}
                          alt={promo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-2 left-2 bg-[#FF7A00] text-black font-black text-[9px] px-2 py-0.5 rounded-md">
                          -{promo.discountPercentage}% OFF
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-white group-hover:text-[#FF7A00] transition-colors">{promo.title}</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{promo.description}</p>
                        </div>
                        {promo.couponCode && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-zinc-500">Cupón: <b className="text-white bg-zinc-800 px-2 py-1 rounded">{promo.couponCode}</b></span>
                            <div className="flex items-center gap-2">
                              {promo.id === "pr2" && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const empaProd = products.find(p => p.id === "e4" || p.category === "Empanadas");
                                    if (empaProd) {
                                      handleAddToCart(empaProd);
                                    }
                                    setCouponCode(promo.couponCode || "EMPAFEST");
                                    setCouponDiscount(promo.discountPercentage);
                                    setCouponApplied(promo.couponCode || "EMPAFEST");
                                    showToast("¡Docena de Empanadas Gourmet y cupón del 15% aplicados!", "success");
                                  }}
                                  className="text-[10px] bg-[#FF7A00] text-black font-black px-2.5 py-1 rounded-lg hover:bg-orange-400 transition-colors"
                                >
                                  🥟 Pedir Promo
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCouponCode(promo.couponCode || "");
                                  setCouponDiscount(promo.discountPercentage);
                                  setCouponApplied(promo.couponCode || "");
                                  showToast(`¡Cupón ${promo.couponCode} aplicado (-${promo.discountPercentage}%)!`, "success");
                                }}
                                className="text-[10px] text-[#FF7A00] hover:underline font-bold"
                              >
                                Aplicar Cupón
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PRODUCTS MENU GRID */}
              <div>
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#FF7A00]" />
                  Nuestros Platos ({filteredProducts.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`group bg-[#0d0d0d] border ${
                        product.available ? "border-[#1f1f1f] hover:border-[#FF7A00]/50" : "border-zinc-900 opacity-75"
                      } rounded-2xl p-4 transition-all flex flex-col justify-between relative overflow-hidden`}
                    >
                      {/* Product availability or tags badge */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                        {product.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-black/80 backdrop-blur-md text-[#FF7A00] border border-[#FF7A00]/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Image and Price headers */}
                      <div className="relative h-40 w-full rounded-xl overflow-hidden bg-zinc-900 mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {!product.available && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">Sin Stock</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md px-3 py-1 rounded-xl border border-zinc-800 font-bold">
                          <span className="text-[#FF7A00] text-sm font-extrabold">${product.price}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#FF7A00] transition-colors">{product.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">{product.description}</p>
                        
                        {/* Ingredients pill list */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.ingredients.slice(0, 3).map((ing, idx) => (
                            <span key={idx} className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded">
                              {ing}
                            </span>
                          ))}
                          {product.ingredients.length > 3 && (
                            <span className="text-[10px] text-zinc-600 px-1 py-0.5">+{product.ingredients.length - 3}</span>
                          )}
                        </div>
                      </div>

                      {/* Action trigger */}
                      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> PREP: {product.preparationTimeMin} min
                        </span>
                        
                        {product.available ? (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-white text-black text-xs font-black py-2 px-3.5 rounded-xl hover:bg-[#FF7A00] hover:text-white transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                          </button>
                        ) : (
                          <button disabled className="text-xs text-zinc-600 bg-zinc-950 border border-zinc-900 py-1.5 px-3 rounded-xl cursor-not-allowed">
                            Agotado
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOCAL MAP & CONTACT INFO CARD */}
              <div className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-lg font-extrabold mb-2">📍 Ubicación y Reparto</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Nuestra cocina central se ubica en **San Benito, Entre Ríos**. Abiertos de Martes a Domingos de 19:30 a 00:00hs.
                    Hacemos envíos con cadetes de confianza a toda la planta urbana de San Benito, loteos linderos y colectoras de Ruta 12.
                  </p>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <p className="text-zinc-300">📞 WhatsApp de Pedidos: <span className="font-bold text-[#FF7A00]">{tenant.phone}</span></p>
                    <p className="text-zinc-300">🏠 Dirección: <span className="font-medium">{tenant.address}</span></p>
                  </div>
                </div>

                {/* Simulated Visual Vector map representation */}
                <div className="relative h-40 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "12px 12px" }}></div>
                  <div className="absolute h-0.5 w-full bg-zinc-800 rotate-[22deg]"></div>
                  <div className="absolute h-0.5 w-full bg-zinc-800 -rotate-[10deg]"></div>
                  <div className="absolute w-0.5 h-full bg-zinc-800 left-1/3"></div>
                  
                  {/* Pointers */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00] border-2 border-white flex items-center justify-center shadow-lg animate-pulse text-xs">🏠</div>
                    <span className="text-[9px] font-bold text-[#FF7A00] bg-black px-1.5 py-0.5 rounded border border-zinc-800 mt-1">DON OMAR</span>
                  </div>
                  
                  <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-white border border-black flex items-center justify-center text-[10px]">📍</div>
                    <span className="text-[8px] text-zinc-400 bg-black/80 px-1 rounded mt-0.5">San Benito Plaza</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side: Shopping Cart & Checkout Form sidebar */}
            <aside className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-[#1f1f1f] bg-[#0a0a0a] flex flex-col">
              
              {/* IF ACTIVE TRACKING ORDER EXISTS: TRACKER BADGE */}
              {activeTrackingOrder && (
                <div className="p-4 bg-[#FF7A00]/5 border-b border-[#FF7A00]/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                      <p className="text-xs font-bold text-white">Pedido Activo: {activeTrackingOrder.id}</p>
                      <p className="text-[10px] text-[#FF7A00] uppercase font-bold tracking-wider">{activeTrackingOrder.status.replace("_", " ")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("rider");
                      showToast("Abriendo consola de seguimiento");
                    }}
                    className="text-[10px] bg-[#FF7A00] hover:bg-[#FF7A00]/85 text-black px-3 py-1.5 rounded-lg font-black transition-all"
                  >
                    VER MAPA
                  </button>
                </div>
              )}

              {/* CART ITEMS PANEL */}
              <div className="p-5 border-b border-zinc-900 flex-1 flex flex-col min-h-[250px] overflow-y-auto">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center justify-between">
                  <span>Tu Carrito de Compras</span>
                  <span className="text-[#FF7A00] font-mono text-xs font-extrabold">{cart.length} items</span>
                </h3>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">🛒</div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400">El carrito está vacío</p>
                      <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1">Elegí lo que quieras del menú para agregarlo.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-start gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-zinc-100">{item.product.name}</p>
                          {item.notes && <p className="text-[10px] text-zinc-500 italic mt-0.5">Nota: {item.notes}</p>}
                          
                          {/* Item individual note builder */}
                          <input
                            type="text"
                            placeholder="Aclaración (sin cebolla, etc)..."
                            value={item.notes || ""}
                            onChange={(e) => {
                              const noteVal = e.target.value;
                              setCart(prev => prev.map((c, idx) => idx === index ? { ...c, notes: noteVal } : c));
                            }}
                            className="mt-1.5 w-full bg-transparent border-b border-zinc-800 text-[10px] text-zinc-400 placeholder-zinc-700 focus:outline-none focus:border-zinc-500"
                          />
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xs font-black text-[#FF7A00]">${item.product.price * item.quantity}</p>
                          
                          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.notes || "", -1)}
                              className="p-1 text-zinc-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleAddToCart(item.product, item.notes)}
                              className="p-1 text-[#FF7A00] hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.product.id, item.notes || "")}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* COUPON INPUT */}
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-900">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CUPÓN (ej: LOMOGURI)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs uppercase placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00]"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="text-[10px] text-[#FF7A00] mt-1">¡Cupón activado para esta compra!</p>
                    )}
                  </div>
                )}
              </div>

              {/* CHECKOUT SUBMISSION FORM */}
              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="p-5 bg-black border-t border-zinc-900 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Datos de Envío y Pago</h4>

                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Nombre y Apellido *"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="Teléfono (Ej: 3435551122) *"
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        required
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Dirección (Calle y Altura) *"
                        required
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                      />
                      <select
                        value={checkoutBarrio}
                        onChange={(e) => setCheckoutBarrio(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#FF7A00]"
                      >
                        {BARRIOS_SAN_BENITO.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name} (+${b.extraFee})
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Observaciones de entrega (ej: Portón negro, timbre...)"
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* PAYMENT METHOD SELECTOR */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("mercado_pago")}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                          paymentMethod === "mercado_pago"
                            ? "bg-[#FF7A00]/10 border-[#FF7A00] text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span>💙 Mercado Pago</span>
                        <span className="text-[9px] text-green-400">Online</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("transferencia")}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                          paymentMethod === "transferencia"
                            ? "bg-[#FF7A00]/10 border-[#FF7A00] text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span>🏦 Transferencia</span>
                        <span className="text-[9px] text-zinc-500">Subir Captura</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("efectivo")}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-left ${
                          paymentMethod === "efectivo"
                            ? "bg-[#FF7A00]/10 border-[#FF7A00] text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        💵 Efectivo al Recibir
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("tarjeta")}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-left ${
                          paymentMethod === "tarjeta"
                            ? "bg-[#FF7A00]/10 border-[#FF7A00] text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        💳 Posnet (Tarjeta)
                      </button>
                    </div>
                  </div>

                  {/* TRANSFER BANNER & SCREENSHOT UPLOADER */}
                  {paymentMethod === "transferencia" && (
                    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                      <div className="text-[10px] text-zinc-400 space-y-1">
                        <p className="font-bold text-white">Datos de cuenta para transferir:</p>
                        <p>Banco: **Nuevo Banco de Entre Ríos**</p>
                        <p>CBU: **3860012304958102348574**</p>
                        <p>Alias: **don.omar.sanbe**</p>
                        <p>Titular: **Omar J. Marizza**</p>
                      </div>

                      {/* File Uploader supporting drag & drop style or file choice */}
                      <div className="border border-dashed border-zinc-800 rounded-lg p-2.5 flex flex-col items-center justify-center bg-black hover:border-[#FF7A00]/50 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleScreenshotUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                        <span className="text-[10px] font-bold text-zinc-400">Elegir comprobante o captura</span>
                        <span className="text-[8px] text-zinc-600">Sube el ticket bancario para validarlo</span>
                      </div>

                      {screenshotPreview && (
                        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-850">
                          <img src={screenshotPreview} alt="Screenshot" className="w-8 h-8 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold truncate text-green-400">Comprobante_cargado.jpg</p>
                            <p className="text-[8px] text-zinc-500">Listo para revisión</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setScreenshotPreview(null)}
                            className="text-red-500 text-[10px] hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PRICE CALCULATIONS */}
                  <div className="space-y-1.5 pt-3 border-t border-zinc-900 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal platos</span>
                      <span className="font-mono text-zinc-300">
                        ${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Costo de Envío ({checkoutBarrio})</span>
                      <span className="font-mono text-zinc-300">
                        ${tenant.deliveryFee + (BARRIOS_SAN_BENITO.find(b => b.name === checkoutBarrio)?.extraFee || 0)}
                      </span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-[#FF7A00]">
                        <span>Descuento cupón (-{couponDiscount}%)</span>
                        <span className="font-mono">
                          -${Math.round(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * (couponDiscount / 100))}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-zinc-900">
                      <span>Total final</span>
                      <span className="text-[#FF7A00] font-mono">
                        ${
                          cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) +
                          (tenant.deliveryFee + (BARRIOS_SAN_BENITO.find(b => b.name === checkoutBarrio)?.extraFee || 0)) -
                          Math.round(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * (couponDiscount / 100))
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF7A00] text-black font-black py-4 rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl shadow-[#FF7A00]/10 flex items-center justify-center gap-2 uppercase text-xs"
                  >
                    <ShoppingBag className="w-4 h-4" /> Confirmar Pedido de Comida
                  </button>

                  <p className="text-[10px] text-zinc-500 text-center">
                    Al confirmar, el pedido se envía directamente al Panel de Cocina y notificará automáticamente a los cadetes linderos.
                  </p>
                </form>
              )}

            </aside>
          </div>
        )}

        {/* =====================================================================
            KITCHEN CONSOLE TAB
            ===================================================================== */}
        {activeTab === "kitchen" && (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-black">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-5">
              <div>
                <span className="text-[10px] text-[#FF7A00] font-bold uppercase tracking-widest font-mono">Terminal de Despacho de Platos</span>
                <h2 className="text-2xl font-black text-zinc-100 flex items-center gap-2">
                  🍳 Panel de Cocina Full-Screen 
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md border border-red-500/30">
                    {orders.filter(o => ["recibido", "pago_aprobado", "preparando"].includes(o.status)).length} por hacer
                  </span>
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-xs text-zinc-500 font-mono">
                  ORDENADO POR PRIORIDAD DE LLEGADA
                </div>
                <button
                  onClick={() => {
                    // Simulate automatic printing
                    showToast("Enviando cola de impresión de tickets a comandera térmica...");
                  }}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> Impresión Automática (ON)
                </button>
              </div>
            </div>

            {/* Grid of Kitchen order tickets */}
            {orders.filter(o => o.status !== "entregado" && o.status !== "cancelado").length === 0 ? (
              <div className="rounded-2xl border border-zinc-900 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 border border-zinc-800 mx-auto">✓</div>
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-300">¡Cocina al día!</h4>
                  <p className="text-xs text-zinc-500 mt-1">No hay comandas activas en este momento. Los nuevos pedidos de los clientes aparecerán acá al instante.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders
                  .filter(o => o.status !== "entregado" && o.status !== "cancelado")
                  .map((order) => {
                    const minutesPassed = Math.round((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
                    const remainingTime = Math.max(1, (order.preparationETA || 25) - minutesPassed);
                    
                    // Style by urgency and status
                    let cardBorder = "border-zinc-800";
                    let stateBadgeColor = "bg-zinc-800 text-zinc-400";
                    
                    if (order.status === "recibido") {
                      cardBorder = "border-blue-500/50 shadow-lg shadow-blue-500/5";
                      stateBadgeColor = "bg-blue-500 text-black";
                    } else if (order.status === "pago_pendiente") {
                      cardBorder = "border-yellow-500/40";
                      stateBadgeColor = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30";
                    } else if (order.status === "preparando" || order.status === "en_cocina") {
                      cardBorder = "border-[#FF7A00]/50 shadow-lg shadow-[#FF7A00]/5";
                      stateBadgeColor = "bg-[#FF7A00] text-black";
                    } else if (order.status === "listo") {
                      cardBorder = "border-green-500/50";
                      stateBadgeColor = "bg-green-500 text-black";
                    }

                    return (
                      <div key={order.id} className={`bg-[#0d0d0d] border ${cardBorder} rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden`}>
                        
                        {/* Ticket header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-mono font-black text-white">{order.id}</span>
                            <p className="text-[10px] text-zinc-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.customerName}</p>
                          </div>
                          
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${stateBadgeColor}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Order Notes alerts */}
                        {order.notes && (
                          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] text-yellow-400 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span><b>Aclaración:</b> {order.notes}</span>
                          </div>
                        )}

                        {/* Items listed */}
                        <div className="space-y-2 border-y border-zinc-900 py-3 my-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="font-bold text-zinc-200">
                                <span className="text-[#FF7A00] font-mono mr-2">{item.quantity}x</span>
                                {item.product.name}
                              </span>
                              {item.notes && <p className="text-[9px] text-zinc-500 block">({item.notes})</p>}
                            </div>
                          ))}
                        </div>

                        {/* Prep timer / progress tracker */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">Tiempo de espera estimado:</span>
                          <span className={`font-mono font-bold flex items-center gap-1 ${remainingTime < 5 ? 'text-red-500' : 'text-zinc-200'}`}>
                            <Clock className="w-3.5 h-3.5" /> {remainingTime} min restante
                          </span>
                        </div>

                        {/* BANK TRANSFER PREVIEW INSIDE TICKET */}
                        {order.paymentMethod === "transferencia" && order.paymentScreenshot && (
                          <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-900">
                            <p className="text-[9px] text-zinc-400 mb-1 font-bold">💳 Captura de Pago por Transferencia:</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <img src={order.paymentScreenshot} alt="Ticket" className="w-8 h-8 object-cover rounded" />
                                <span className="text-[8px] text-zinc-500">Adjunto del Cliente</span>
                              </div>
                              <button
                                onClick={() => {
                                  // Auto approve pay
                                  handleUpdateOrderStatus(order.id, "pago_aprobado");
                                  showToast(`Pago aprobado para el pedido ${order.id}`);
                                }}
                                className="text-[9px] text-[#FF7A00] hover:underline font-bold"
                              >
                                Aprobar Pago ✔
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STATE CHANGER ACTION TRIGGERS */}
                        <div className="flex gap-2 pt-2">
                          {order.status === "pago_pendiente" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "pago_aprobado")}
                              className="flex-1 bg-yellow-500 text-black text-[10px] font-black py-2.5 rounded-xl uppercase hover:opacity-90 transition-opacity"
                            >
                              Aprobar Pago manual
                            </button>
                          )}
                          {order.status === "recibido" || order.status === "pago_aprobado" ? (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "preparando")}
                              className="flex-1 bg-[#FF7A00] text-black text-[10px] font-black py-2.5 rounded-xl uppercase hover:opacity-90 transition-opacity"
                            >
                              Empezar Cocina 🥣
                            </button>
                          ) : null}
                          {order.status === "preparando" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "listo")}
                              className="flex-1 bg-green-500 text-black text-[10px] font-black py-2.5 rounded-xl uppercase hover:opacity-90 transition-opacity"
                            >
                              Marcar Listo ✔
                            </button>
                          )}
                          {order.status === "listo" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "cadete_asignado")}
                              className="flex-1 bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-black py-2.5 rounded-xl uppercase hover:bg-zinc-700 transition-colors"
                            >
                              Asignar Cadete 🛵
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
              </div>
            )}

          </div>
        )}

        {/* =====================================================================
            RIDER CONSOLE & REAL-TIME TRACKING TAB
            ===================================================================== */}
        {activeTab === "rider" && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-black">
            
            {/* Rider Console settings & control left sidebar */}
            <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-900 p-6 space-y-6 flex flex-col">
              <div>
                <span className="text-[10px] text-[#FF7A00] font-bold uppercase tracking-widest font-mono">Consola del Distribuidor</span>
                <h3 className="text-xl font-black text-white">App del Cadete</h3>
                <p className="text-zinc-500 text-xs mt-1">Simulá las acciones del cadete en calle o monitoreá los repartos.</p>
              </div>

              {/* RIDER SELECTION dropdown to test multi-riders on layout */}
              <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Repartidor Activo</label>
                <div className="flex items-center space-x-3">
                  <img src={activeRider?.avatar} alt={activeRider?.name} className="w-10 h-10 rounded-full object-cover border border-[#FF7A00]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{activeRider?.name}</p>
                    <p className="text-[9px] text-[#FF7A00] uppercase font-semibold">Estado: {activeRider?.status}</p>
                  </div>
                </div>
              </div>

              {/* LIST OF PENDING SHIPPINGS FOR ACTIVE RIDER */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Viajes Asignados ({orders.filter(o => o.status !== "entregado" && o.status !== "cancelado").length})</h4>
                
                {orders.filter(o => o.status !== "entregado" && o.status !== "cancelado").map(order => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setTrackingOrderId(order.id);
                      showToast(`Monitoreando Pedido ${order.id}`);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      trackingOrderId === order.id
                        ? "bg-[#FF7A00]/10 border-[#FF7A00] text-white"
                        : "bg-[#0a0a0a] border-zinc-900 hover:border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>{order.id}</span>
                      <span className="text-[10px] uppercase text-[#FF7A00]">{order.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">Dirección: {order.address}</p>
                    <p className="text-[10px] text-zinc-300 font-bold mt-1">Total: ${order.total}</p>

                    {/* Simulation buttons inside Rider console */}
                    {trackingOrderId === order.id && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-900 grid grid-cols-2 gap-1.5">
                        {order.status === "cadete_asignado" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(order.id, "en_camino");
                              showToast(`El cadete inició el recorrido para el pedido ${order.id}`);
                            }}
                            className="bg-[#FF7A00] text-black text-[9px] font-black py-1.5 rounded-lg uppercase"
                          >
                            Iniciar Ruta 🚀
                          </button>
                        )}
                        {order.status === "en_camino" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(order.id, "entregado");
                              showToast(`¡Pedido ${order.id} entregado con éxito por el cadete!`);
                              triggerN8NWebhook("order_delivered", { orderId: order.id, customer: order.customerName, total: order.total });
                            }}
                            className="bg-green-500 text-black text-[9px] font-black py-1.5 rounded-lg uppercase"
                          >
                            Llegué / Entregado ✔
                          </button>
                        )}
                        <a
                          href={`tel:${order.customerPhone}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Llamando al cliente ${order.customerName} (${order.customerPhone})`, "info");
                          }}
                          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-[9px] font-bold py-1.5 rounded-lg flex items-center justify-center text-center"
                        >
                          📞 Llamar
                        </a>
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast("Abriendo WhatsApp con el cliente...", "info");
                          }}
                          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-[9px] font-bold py-1.5 rounded-lg flex items-center justify-center text-center"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </aside>

            {/* Live Map Tracking Panel visualization container */}
            <section className="flex-1 p-6 md:p-8 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Mapa de Envíos en Tiempo Real</h3>
                  {activeTrackingOrder ? (
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Siguiendo envío del pedido <b>{activeTrackingOrder.id}</b> asignado a <b>{activeRider?.name}</b>.
                    </p>
                  ) : (
                    <p className="text-zinc-500 text-xs mt-0.5">Selecciona un pedido de la lista izquierda para seguir la moto en vivo.</p>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-zinc-800">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">SUPABASE REALTIME SYNC</span>
                </div>
              </div>

              {/* MAP BODY */}
              <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden min-h-[400px] flex items-center justify-center">
                {/* SVG background simulation of San Benito streets, roads and routes */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Routes */}
                    <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="white" strokeWidth="6" />
                    <line x1="20%" y1="90%" x2="80%" y2="10%" stroke="white" strokeWidth="4" />
                    <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="white" strokeWidth="2" />
                    {/* River / Brook representation */}
                    <path d="M 0 10 Q 200 150 400 50 T 800 300" fill="none" stroke="blue" strokeWidth="10" opacity="0.3" />
                  </svg>
                </div>

                {/* CENTRAL HUB: ROTISERIA DON OMAR */}
                <div className="absolute top-[60%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full bg-[#FF7A00] border-2 border-white flex items-center justify-center shadow-lg shadow-[#FF7A00]/40 text-sm">
                    🏢
                  </div>
                  <span className="text-[10px] font-bold text-zinc-300 bg-black/90 px-2 py-0.5 rounded border border-zinc-800 mt-1">Don Omar Cocina</span>
                </div>

                {/* CLIENT DESTINATION POINT */}
                {activeTrackingOrder && (
                  <div className="absolute top-[30%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-[#FF7A00] flex items-center justify-center shadow-lg text-sm">
                      📍
                    </div>
                    <span className="text-[10px] font-bold text-zinc-100 bg-black/90 px-2 py-0.5 rounded border border-zinc-800 mt-1">
                      Destino: {activeTrackingOrder.customerName}
                    </span>
                    <span className="text-[8px] text-[#FF7A00] bg-black px-1.5 rounded font-bold">{activeTrackingOrder.barrio}</span>
                  </div>
                )}

                {/* RIDER MOVING POINT (Simulated coordinate progress on en_camino) */}
                {activeTrackingOrder && activeTrackingOrder.status === "en_camino" ? (
                  <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                    <div className="w-9 h-9 rounded-full bg-[#FF7A00] border-2 border-white flex items-center justify-center shadow-2xl animate-pulse text-base shadow-[#FF7A00]/50">
                      🛵
                    </div>
                    <span className="text-[9px] font-bold text-black bg-[#FF7A00] px-2 py-0.5 rounded shadow mt-1">
                      {activeRider?.name.split(" ")[0]} (En camino)
                    </span>
                    <span className="text-[8px] text-zinc-400 bg-black px-1.5 rounded mt-0.5">ETA: {activeTrackingOrder.deliveryETA} min</span>
                  </div>
                ) : activeTrackingOrder && activeTrackingOrder.status === "cadete_asignado" ? (
                  <div className="absolute top-[58%] left-[33%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-400 flex items-center justify-center text-xs">
                      🛵
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 bg-black/90 px-1.5 rounded mt-1">Cargando pedido...</span>
                  </div>
                ) : null}

                {/* SIMULATION LEGEND overlay */}
                <div className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                  <p className="font-bold text-white mb-1.5">Referencias del Recorrido:</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]"></span>
                    <span>Sede central Don Omar (Av. Friuli)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-700"></span>
                    <span>Domicilio del cliente</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse"></span>
                    <span>Cadete en moto (Simulador GPS)</span>
                  </div>
                </div>

                {/* CONTROL PANEL overlay for client side to fast forward simulation */}
                {activeTrackingOrder && (
                  <div className="absolute top-4 right-4 bg-[#0a0a0a] p-4 rounded-xl border border-zinc-800 max-w-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={activeRider?.avatar} alt={activeRider?.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-[11px] font-bold">{activeRider?.name}</p>
                        <p className="text-[9px] text-zinc-500">{activeRider?.phone}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-zinc-900 pt-2 text-[10px] text-zinc-400 space-y-1">
                      <p>Ruta: **Don Omar ➔ {activeTrackingOrder.address}**</p>
                      <p>Distancia estimada: **2.4 km**</p>
                      <p>Estado pedido: <b className="text-white uppercase text-[9px]">{activeTrackingOrder.status.replace("_", " ")}</b></p>
                    </div>

                    {activeTrackingOrder.status === "en_camino" && (
                      <button
                        onClick={() => {
                          handleUpdateOrderStatus(activeTrackingOrder.id, "entregado");
                          showToast("Entregado simulado!");
                          triggerN8NWebhook("order_delivered", { orderId: activeTrackingOrder.id, customer: activeTrackingOrder.customerName, total: activeTrackingOrder.total });
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-black font-black text-[9px] py-2 rounded-lg transition-colors uppercase"
                      >
                        Completar entrega ✔
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

          </div>
        )}

        {/* =====================================================================
            ADMINISTRATIVE & SAAS CONFIGURATION TAB
            ===================================================================== */}
        {activeTab === "admin" && (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 bg-zinc-950">
            
            {/* SaaS header banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] text-[#FF7A00] font-bold uppercase tracking-widest font-mono">Consola de Administración de Comercios</span>
                <h2 className="text-2xl font-black tracking-tight">SaaS Multi-Tenant Dashboard</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Control global de ventas, auditoría de webhooks N8N, productos del menú y configuración del tenant activo.</p>
              </div>

              {/* TENANT SWAPPER & MANUAL DATABASE SYNCHRONIZER */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-3 bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-medium">Comercio Activo:</span>
                  <select
                    value={tenant.id}
                    onChange={(e) => handleTenantSwitch(e.target.value)}
                    className="bg-black text-xs text-[#FF7A00] font-black border border-zinc-800 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="donomar">Don Omar Rotisería</option>
                    <option value="pizzaloop">Pizza Loop Express</option>
                  </select>
                </div>

                <button
                  onClick={() => syncFromSupabase(false)}
                  disabled={supabaseLoading}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-900 border border-zinc-800 hover:border-[#FF7A00]/50 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow transition-all duration-300 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#FF7A00] ${supabaseLoading ? "animate-spin" : ""}`} />
                  <span>{supabaseLoading ? "Sincronizando..." : "Sincronizar Base de Datos"}</span>
                </button>
              </div>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-2">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Caja Diaria (Ventas)</span>
                  <DollarSign className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <p className="text-2xl font-black text-white">
                  ${orders.filter(o => o.status === "entregado" || o.status === "en_camino" || o.status === "listo").reduce((acc, o) => acc + o.total, 0)}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.4% que ayer</span>
                </div>
              </div>

              <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-2">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Pedidos Totales</span>
                  <Package className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <p className="text-2xl font-black text-white">{orders.length}</p>
                <span className="text-[10px] text-zinc-400">Canales web & PWA</span>
              </div>

              <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-2">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Platos en Menú</span>
                  <Utensils className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <p className="text-2xl font-black text-white">{products.length}</p>
                <span className="text-[10px] text-zinc-400">Con control de stock</span>
              </div>

              <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-2">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Cadetes Activos</span>
                  <Truck className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <p className="text-2xl font-black text-white">{riders.length}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span>Disponibles en San Benito</span>
                </div>
              </div>
            </div>

            {/* TWO COLUMNS: ORDERS TABLE & NEW PRODUCTS / WEBHOOKS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left col: Active Orders Table */}
              <div className="xl:col-span-2 bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Control de Órdenes</h3>
                  <span className="text-xs text-zinc-500">Últimos movimientos</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-900">
                        <th className="pb-3">ID Pedido</th>
                        <th className="pb-3">Cliente / Barrio</th>
                        <th className="pb-3">Detalle Platos</th>
                        <th className="pb-3">Pago</th>
                        <th className="pb-3">Monto</th>
                        <th className="pb-3">Estado</th>
                        <th className="pb-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-900/50">
                          <td className="py-3 font-mono font-bold text-white">{order.id}</td>
                          <td className="py-3 text-zinc-400">
                            <b>{order.customerName}</b>
                            <p className="text-[10px] text-zinc-500">{order.barrio}</p>
                          </td>
                          <td className="py-3 max-w-[150px] truncate text-zinc-300">
                            {order.items.map(i => `${i.quantity}x ${i.product.name.split(" ")[0]}`).join(", ")}
                          </td>
                          <td className="py-3 font-medium uppercase text-[10px]">
                            {order.paymentMethod === "mercado_pago" ? "💙 MP" : "🏦 Transf"}
                          </td>
                          <td className="py-3 font-bold text-white">${order.total}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300">
                              {order.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-black text-[10px] text-zinc-400 border border-zinc-800 rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              <option value="recibido">Recibido</option>
                              <option value="pago_pendiente">Pago Pendiente</option>
                              <option value="pago_aprobado">Pago Aprobado</option>
                              <option value="preparando">Preparando</option>
                              <option value="listo">Listo</option>
                              <option value="cadete_asignado">Asignar Cadete</option>
                              <option value="en_camino">En Camino</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right col: SaaS configuration panel & webhooks */}
              <div className="space-y-6">
                
                {/* TENANT BRAND CUSTOMIZER FORM */}
                <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Editar Marca (Tenant)</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Nombre Comercial</label>
                      <input
                        type="text"
                        value={tenant.name}
                        onChange={(e) => setTenant(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Costo Envío</label>
                        <input
                          type="number"
                          value={tenant.deliveryFee}
                          onChange={(e) => setTenant(prev => ({ ...prev, deliveryFee: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Color Principal</label>
                        <input
                          type="text"
                          value={tenant.primaryColor}
                          onChange={(e) => setTenant(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from("configuracion")
                            .update({
                              name: tenant.name,
                              delivery_fee: tenant.deliveryFee,
                              primary_color: tenant.primaryColor
                            })
                            .eq("tenant_id", tenant.id);
                          if (error) throw error;
                          showToast("¡Configuración guardada en Supabase con éxito!");
                        } catch (e) {
                          console.warn("Could not save to Supabase directly, updated local state:", e);
                          showToast("¡Configuración del Comercio guardada localmente!");
                        }
                        triggerN8NWebhook("tenant_brand_updated", { tenantId: tenant.id, name: tenant.name });
                      }}
                      className="w-full bg-[#FF7A00] text-black text-xs font-black py-2.5 rounded-xl uppercase transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>

                {/* N8N INTEGRATIONS & WEBHOOK EVENTS REAL-TIME TERMINAL */}
                <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-900 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#FF7A00]" />
                      N8N Webhook Auditor
                    </h3>
                    <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono uppercase">Webhooks</span>
                  </div>
                  
                  <p className="text-[10px] text-zinc-500">
                    Visor en tiempo real de eventos despachados para automatizar WhatsApp Business, MercadoPago e email marketing vía N8N.
                  </p>

                  <div className="bg-black rounded-xl p-3 h-52 overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-3 border border-zinc-900 no-scrollbar">
                    {webhookLogs.length === 0 ? (
                      <p className="text-zinc-600 text-center pt-16">Sin actividad de webhooks... Genera una orden para activar.</p>
                    ) : (
                      webhookLogs.map((log, i) => (
                        <div key={i} className="border-b border-zinc-900 pb-2 space-y-1">
                          <div className="flex justify-between text-zinc-500">
                            <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-green-400">{log.status}</span>
                          </div>
                          <p className="text-white font-bold">Event: {log.event}</p>
                          <pre className="text-[8px] text-zinc-500 bg-zinc-950 p-1.5 rounded overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* =====================================================================
          OMARCITO AI FLOATING CHIDGET & WIDGET CONTROL
          ===================================================================== */}
      {/* Floating Omarcito button */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-6 right-6 z-40 bg-[#FF7A00] text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-[#FF7A00]/20"
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">AI</span>
      </button>

      {/* Omarcito Assistant Dialog Panel */}
      {aiOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[350px] md:w-[400px] h-[500px] bg-[#0d0d0d] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="p-4 bg-[#0a0a0a] border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center font-bold text-black text-xs shadow-lg">🍊</div>
              <div>
                <h4 className="text-xs font-bold text-white">Omarcito AI Assistant</h4>
                <p className="text-[8px] text-green-400 uppercase tracking-widest font-mono">Conectado a Gemini 3.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              className="text-zinc-500 hover:text-white text-xs font-bold"
            >
              Cerrar
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs no-scrollbar">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#FF7A00] text-black font-semibold rounded-br-none"
                      : "bg-zinc-900 text-zinc-200 rounded-bl-none border border-zinc-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center space-x-2 bg-zinc-900/50 p-3 rounded-xl max-w-[120px] border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Auto triggers to easily order via chat */}
          <div className="p-2 bg-zinc-950 border-t border-zinc-900 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                const prod = products.find(p => p.id === "l1");
                if (prod) handleAddToCart(prod);
              }}
              className="px-2 py-1 rounded bg-zinc-900 text-zinc-300 text-[10px] hover:text-white whitespace-nowrap"
            >
              🍔 Sumar Lomito Completo
            </button>
            <button
              onClick={() => {
                const prod = products.find(p => p.id === "e1");
                if (prod) handleAddToCart(prod);
              }}
              className="px-2 py-1 rounded bg-zinc-900 text-zinc-300 text-[10px] hover:text-white whitespace-nowrap"
            >
              🥟 Sumar Empanada Carne
            </button>
            <button
              onClick={() => {
                setAiInput("¿Cómo puedo pagar mi pedido?");
                setTimeout(handleSendMessage, 100);
              }}
              className="px-2 py-1 rounded bg-zinc-900 text-zinc-300 text-[10px] hover:text-[#FF7A00] whitespace-nowrap"
            >
              💵 Formas de Pago
            </button>
          </div>

          {/* Input text sender */}
          <div className="p-3 bg-black border-t border-zinc-900 flex gap-2">
            <input
              type="text"
              placeholder="Preguntale algo a Omarcito AI..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF7A00] text-white"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#FF7A00] text-black w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-90 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* FOOTER: SYSTEM ARCHITECTURE LOGS */}
      <footer className="h-10 px-4 md:px-8 bg-black border-t border-[#1f1f1f] flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] py-2 md:py-0">
        <div className="flex space-x-4 text-zinc-600 font-mono">
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>SUPABASE: CONNECTED</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>N8N: COMPATIBLE</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] mr-1.5"></span>MERCADOPAGO: WEB SANDBOX</span>
        </div>
        <div className="text-zinc-500 font-mono">
          © 2026 Don Omar Gastronomía • <span className="text-zinc-300 font-semibold">San Benito, Entre Ríos</span>
        </div>
      </footer>

    </div>
  );
}
