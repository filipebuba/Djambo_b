export interface DishOption {
  name: string;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  time: string;
  calories?: string;
  tags: string[]; // 'vegetarian', 'gluten-free', 'peanut', etc.
  isCustom?: boolean;
  rating: number;
  // Translation fields
  translatedName?: string;
  translatedDescription?: string;
  
  // Advanced Features
  ingredients?: string[];
  macros?: {
    protein: string;
    carbs: string;
    fats: string;
  };
  reasoning?: string; // Why the AI chose this dish
  allergens?: string[];
  
  // Customization
  options?: DishOption[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  translatedText?: string;
  timestamp: Date;
}

export type AppMode = 'LANDING' | 'SCANNING' | 'AUTH' | 'MENU' | 'CREATE_DISH' | 'CHAT' | 'CART' | 'TRANSLATOR' | 'CAMERA_TRANSLATE' | 'AR_PREVIEW' | 'FOOD_ANALYSIS' | 'VIBE_MATCH';

export interface UserPreferences {
  accessibilityMode: 'NONE' | 'BLIND' | 'DEAF' | 'AUTISM';
  language: string; // 'pt-BR', 'en-US', 'ja-JP', 'fr-FR'
  highContrast: boolean;
  allergies: string[]; 
}

export interface CartItem extends Dish {
  quantity: number;
  selectedOptions?: DishOption[];
  cartId: string; // Unique ID for cart management (dishId + options)
}