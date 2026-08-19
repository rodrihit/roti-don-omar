import { Product, Rider, Promotion } from "./types";

export const BARRIOS_SAN_BENITO = [
  { name: "San Benito Centro", extraFee: 0 },
  { name: "Barrio Sol de Mayo", extraFee: 200 },
  { name: "Barrio San Martín", extraFee: 150 },
  { name: "Barrio 25 de Mayo", extraFee: 200 },
  { name: "Barrio El Mercadito", extraFee: 300 },
  { name: "Barrio La Pampita", extraFee: 350 },
  { name: "Zonas de quintas", extraFee: 500 },
  { name: "Ruta 12 Aledaños", extraFee: 600 }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Pizzas
  {
    id: "p1",
    name: "Pizza Muzzarella Don Omar",
    description: "Salsa de tomate casera con condimentos locales, queso muzzarella artesanal derretido, aceitunas verdes entrerrianas y orégano fresco.",
    ingredients: ["Masa casera", "Salsa de tomate casera", "Queso Muzzarella", "Aceitunas", "Orégano"],
    price: 9500,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 15,
    tags: ["Más Vendida", "Casera"]
  },
  {
    id: "p2",
    name: "Pizza Especial con Morrón",
    description: "Salsa de tomate casera, jamón cocido en fetas finas, queso muzzarella premium, morrones asados al horno de barro y olivas.",
    ingredients: ["Masa casera", "Salsa", "Queso Muzzarella", "Jamón Cocido", "Morrón Asado", "Aceitunas"],
    price: 11500,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 18,
    tags: ["Destacada"]
  },
  {
    id: "p3",
    name: "Pizza Fugazzeta Rellena",
    description: "Doble masa casera rellena con muzzarella y jamón, cubierta con lluvia de cebolla caramelizada crujiente, parmesano y oliva.",
    ingredients: ["Masa casera", "Doble Queso Muzzarella", "Jamón Cocido", "Cebolla Caramelizada", "Parmesano"],
    price: 12500,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 22,
    tags: ["Abundante"]
  },

  // Empanadas
  {
    id: "e1",
    name: "Empanada de Carne Criolla al Cuchillo",
    description: "Carne seleccionada cortada a cuchillo, sofrita en grasa de pella con cebolla, morrón, huevo duro picado y cebollita de verdeo. Masa hojaldrada bien jugosa.",
    ingredients: ["Carne cortada a cuchillo", "Cebolla", "Morrón", "Huevo duro", "Cebollita de verdeo", "Masa hojaldrada"],
    price: 1200,
    category: "Empanadas",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 10,
    tags: ["Favorita Local", "Gourmet", "Frita o Horno"]
  },
  {
    id: "e2",
    name: "Empanada de Jamón y Queso Cremoso",
    description: "Abundante queso muzzarella fundido de campo con jamón cocido premium y un toque de orégano serrano.",
    ingredients: ["Jamón Cocido", "Queso Muzzarella", "Orégano Serrano"],
    price: 1200,
    category: "Empanadas",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 10,
    tags: ["Clásica", "Muzzarella"]
  },
  {
    id: "e3",
    name: "Empanada de Pollo al Verdeo Gourmet",
    description: "Pechuga de pollo desmenuzada con crema, cebolla de verdeo fresca y pimientos asados.",
    ingredients: ["Pollo desmenuzado", "Cebollita de verdeo", "Crema suave", "Pimientos"],
    price: 1200,
    category: "Empanadas",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 10,
    tags: ["Especial", "Gourmet"]
  },
  {
    id: "e4",
    name: "Docena de Empanadas Gourmet Don Omar",
    description: "Caja de 12 empanadas gourmet a elección (Carne al cuchillo, Jamón y Queso, Pollo al verdeo). Masa dorada y crujiente recién horneada.",
    ingredients: ["12 Empanadas a elección", "Masa hojaldrada artesanal"],
    price: 12500,
    category: "Empanadas",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 15,
    tags: ["Promo Docena", "Ahorro", "Gourmet"]
  },

  // Hamburguesas
  {
    id: "h1",
    name: "Hamburguesa Don Omar XL",
    description: "Doble medallón de carne vacuna premium elaborada en casa, doble queso cheddar, jamón, huevo frito, lechuga, tomate y aderezos. Con papas fritas gigantes.",
    ingredients: ["Doble Medallón de Ternera", "Queso Cheddar", "Jamón", "Huevo Frito", "Lechuga", "Tomate", "Papas Fritas"],
    price: 8900,
    category: "Hamburguesas",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 15,
    tags: ["Gigante", "Con Papas"]
  },

  // Lomitos
  {
    id: "l1",
    name: "Lomito Completo Especial",
    description: "Bife de lomo tiernizado de primera a la plancha, jamón, queso muzzarella fundido, huevo frito a caballo, lechuga fresca, tomate y mayonesa casera en pan lactal extra grande de panadería. Acompañado de papas fritas caseras.",
    ingredients: ["Bife de Lomo", "Queso Muzzarella", "Jamón Cocido", "Huevo Frito", "Lechuga", "Tomate", "Pan de Lomo XL", "Papas Fritas"],
    price: 10500,
    category: "Lomitos",
    image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 20,
    tags: ["Súper Abundante", "El Más Vendido"]
  },

  // Milanesas
  {
    id: "m1",
    name: "Milanesa de Ternera Napolitana Gigante",
    description: "Milanesa de nalga tierna empanada con receta secreta, frita a la perfección, cubierta con salsa portuguesa, jamón, muzzarella gratinada y rodajas de tomate. Comen 2 o 3 personas. Con papas fritas.",
    ingredients: ["Milanesa de Ternera", "Salsa Portuguesa", "Jamón", "Queso Muzzarella", "Tomate", "Papas Fritas"],
    price: 13900,
    category: "Milanesas",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 25,
    tags: ["Para Compartir", "Familiar"]
  },

  // Pastas
  {
    id: "pa1",
    name: "Tallarines Caseros con Estofado",
    description: "Pasta de huevo al dente estirada a mano por Don Omar, bañada en una salsa de estofado de ternera cocido a fuego lento durante 4 horas.",
    ingredients: ["Tallarines caseros de huevo", "Salsa Boloñesa", "Trozos de Carne de Estofado", "Queso Rallado"],
    price: 7800,
    category: "Pastas",
    image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 20,
    tags: ["Tradicional", "Bajo en Grasa"]
  },

  // Minutas
  {
    id: "mi1",
    name: "Suprema de Pollo con Puré",
    description: "Suprema de pechuga deshuesada crujiente acompañada de un cremoso puré de papas casero con manteca y leche.",
    ingredients: ["Pechuga de Pollo", "Pan rallado provenzal", "Puré de Papas"],
    price: 7200,
    category: "Minutas",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 18,
    tags: ["Fácil y Rico"]
  },

  // Bebidas
  {
    id: "b1",
    name: "Cerveza Schneider 1L",
    description: "Cerveza rubia bien fría, ideal para acompañar las empanadas o la milanesa.",
    ingredients: ["Cerveza rubia de litro"],
    price: 3200,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 2,
    tags: ["Bebida Fría"]
  },
  {
    id: "b2",
    name: "Gaseosa Cola 1.5L",
    description: "Gaseosa familiar súper refrescante.",
    ingredients: ["Bebida cola"],
    price: 2500,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 2,
    tags: ["Familiar"]
  },

  // Postres
  {
    id: "po1",
    name: "Flan Casero Don Omar",
    description: "Receta de la abuela con 8 huevos frescos, vainilla natural, servido con una generosa cucharada de dulce de leche repostero entrerriano.",
    ingredients: ["Leche entero", "Huevos", "Azúcar", "Esencia de Vainilla", "Dulce de Leche"],
    price: 3200,
    category: "Postres",
    image: "https://images.unsplash.com/photo-1528975604071-b4daaf22b8b8?w=500&auto=format&fit=crop&q=80",
    available: true,
    preparationTimeMin: 5,
    tags: ["Imperdible"]
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "pr1",
    title: "Combo Guri de Lomo Completo",
    description: "Comprando 1 Lomito Completo Don Omar, te llevás una gaseosa de 1.5L o cerveza Schneider de regalo por solo $11.500.",
    discountPercentage: 20,
    couponCode: "LOMOGURI",
    bannerImage: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80",
    expiryDate: "2026-12-31"
  },
  {
    id: "pr2",
    title: "Miércoles de Empanadas Gourmet",
    description: "¡Festejá la mitad de semana con la docena de empanadas gourmet a elección por solo $11.000 aplicando el cupón EMPAFEST!",
    discountPercentage: 15,
    couponCode: "EMPAFEST",
    bannerImage: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop&q=80",
    expiryDate: "2026-08-31"
  }
];

export const INITIAL_RIDERS: Rider[] = [
  {
    id: "cadete1",
    name: "Juan 'El Rayo' Marizza",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    phone: "+54 343 555-4321",
    status: "disponible",
    currentLocation: {
      lat: -31.7820,
      lng: -60.4350,
      street: "Av. Friuli 1200"
    }
  },
  {
    id: "cadete2",
    name: "Enzo 'Pela' Guri",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    phone: "+54 343 555-8899",
    status: "disponible",
    currentLocation: {
      lat: -31.7850,
      lng: -60.4300,
      street: "Calle Rivadavia y Garay"
    }
  }
];
