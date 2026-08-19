export interface TenantConfig {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  deliveryFee: number;
  estimatedPreparationMin: string;
  estimatedDeliveryMin: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  discountPrice?: number;
  category: CategoryType;
  image: string;
  available: boolean;
  preparationTimeMin: number;
  tags: string[];
  isPromo?: boolean;
}

export type CategoryType =
  | "Pizzas"
  | "Empanadas"
  | "Hamburguesas"
  | "Lomitos"
  | "Sandwiches"
  | "Milanesas"
  | "Pastas"
  | "Minutas"
  | "Bebidas"
  | "Postres"
  | "Promociones";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus =
  | "recibido"
  | "pago_pendiente"
  | "pago_aprobado"
  | "preparando"
  | "en_cocina"
  | "listo"
  | "cadete_asignado"
  | "en_camino"
  | "entregado"
  | "cancelado";

export interface Order {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  barrio: string;
  notes?: string;
  paymentMethod: "mercado_pago" | "transferencia" | "efectivo" | "tarjeta";
  paymentScreenshot?: string; // Base64 or mock Storage URL
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  preparationETA?: number; // Minutes
  deliveryETA?: number; // Minutes
  riderId?: string;
  couponCode?: string;
  // Coordinates for GPS simulation
  gpsLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Rider {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: "disponible" | "ocupado" | "offline";
  currentLocation: {
    lat: number;
    lng: number;
    street: string;
  };
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  couponCode?: string;
  bannerImage: string;
  expiryDate: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  payload: any;
  status: string;
}
