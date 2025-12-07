import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  CreditCard, 
  ChefHat, 
  MessageSquare, 
  ShoppingBag, 
  Utensils, 
  Mic, 
  Globe, 
  Accessibility, 
  ChevronLeft,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Ear,
  Eye,
  Volume2,
  Sparkles,
  Play,
  Search,
  Filter,
  Wine,
  Coffee,
  IceCream,
  ThumbsUp,
  RefreshCw,
  ArrowRight,
  Clock,
  Flame,
  Camera,
  Languages,
  ArrowLeftRight,
  Star,
  BellRing,
  Box,
  MapPin,
  ScanEye,
  ImagePlus,
  AlertTriangle,
  Leaf,
  BrainCircuit,
  Wand2
} from 'lucide-react';
import { Dish, CartItem, AppMode, UserPreferences, ChatMessage, DishOption } from './types';
import { MOCK_MENU } from './constants';
import DishCard from './components/DishCard';
import { generateCustomDish, chatWithChef, translateMenuBatch, translateText, personalizeMenuImages, identifyDishFromImage, analyzeVibe } from './services/geminiService';

// Language Config
const LANGUAGES = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
];

// --- UI TRANSLATIONS ---
const TRANSLATIONS: Record<string, any> = {
  'pt-BR': {
    menu: "Menu", create: "Criar", cart: "Pedido", search: "Buscar...",
    starters: "Entradas", mains: "Pratos", drinks: "Bebidas",
    cartTitle: "Seu Pedido", total: "Total", confirm: "Confirmar",
    validating: "Validando Pagamento...", preauth: "Pré-autorizando R$ 1,00...",
    ready: "Tudo Pronto!", paymentAuth: "Seu pagamento está pré-autorizado.",
    orderFree: "Faça quantos pedidos quiser!", 
    quote: "\"Quando perceberem quem você é, sua comida já estará na mesa.\"",
    createTitle: "Criar Prato Exclusivo",
    dishCreated: "Prato Criado!",
    aiDesc: "O Chef Gemini criou esta receita baseada no seu pedido e no estoque disponível.",
    change: "Gostaria de mudar algo?",
    changePlaceholder: "Ex: Menos picante, troque o arroz por salada...",
    approve: "Aprobar e Adicionar ao Menu",
    discard: "Descartar e começar de novo",
    whatEat: "O que você quer comer hoje?",
    describeWish: "Descreva seu desejo e nosso Chef I.A. criará uma receita única com os ingredientes disponíveis.",
    wishPlaceholder: "Ex: Quero algo leve com frango e vegetais, mas sem glúten...",
    imgLoaded: "Imagem Carregada", useRef: "Usar foto de ref.",
    creating: "O Chef está criando...", createBtn: "Criar Receita Exclusiva",
    ingredients: "Ingredientes Disponíveis Hoje",
    interpreter: "Intérprete Ao Vivo",
    kitchen: "Cozinha",
    arAdd: "Adicionar ao Pedido", arAdded: "Adicionado!",
    arPrompt: "Aponte para a mesa para ver o prato",
    scan: "Lendo QR Code...", simulate: "Simular Sucesso",
    vibeMatch: "VIBE MATCH", vibeDetected: "Vibe Detectada",
    chefSuggests: "O Chef sugere:", tryAgain: "Tentar de novo",
    orderNow: "Pedir Agora", vibePrompt: "Qual é a sua fome hoje?",
    visionTitle: "GEMINI VISION v3.0", calories: "Calorias",
    estPrice: "Preço Est.", mainIngredients: "Ingredientes Principais",
    allGood: "Tudo certo", pointAnalyze: "Aponte para analisar",
    start: "Começar",
    exclusive: "✨ Exclusivo",
    personalize: "Personalize:",
    add: "Adicionar",
    time: "Tempo",
    emptyCart: "Seu carrinho está vazio.",
    itemAdded: "adicionado ao pedido.",
    currency: "R$"
  },
  'en-US': {
    menu: "Menu", create: "Create", cart: "Order", search: "Search...",
    starters: "Starters", mains: "Mains", drinks: "Drinks",
    cartTitle: "Your Order", total: "Total", confirm: "Confirm",
    validating: "Validating Payment...", preauth: "Pre-authorizing $1.00...",
    ready: "All Set!", paymentAuth: "Your payment is pre-authorized.",
    orderFree: "Order as much as you like!", 
    quote: "\"By the time they realize who you are, your food will be on the table.\"",
    createTitle: "Create Exclusive Dish",
    dishCreated: "Dish Created!",
    aiDesc: "Chef Gemini created this recipe based on your request and available stock.",
    change: "Want to change something?",
    changePlaceholder: "Ex: Less spicy, swap rice for salad...",
    approve: "Approve and Add to Menu",
    discard: "Discard and start over",
    whatEat: "What do you want to eat today?",
    describeWish: "Describe your wish and our AI Chef will create a unique recipe.",
    wishPlaceholder: "Ex: I want something light with chicken and veggies, but gluten-free...",
    imgLoaded: "Image Loaded", useRef: "Use ref photo",
    creating: "Chef is creating...", createBtn: "Create Exclusive Recipe",
    ingredients: "Ingredients Available Today",
    interpreter: "Live Interpreter",
    kitchen: "Kitchen",
    arAdd: "Add to Order", arAdded: "Added!",
    arPrompt: "Point at table to view dish",
    scan: "Scanning QR Code...", simulate: "Simulate Success",
    vibeMatch: "VIBE MATCH", vibeDetected: "Vibe Detected",
    chefSuggests: "Chef suggests:", tryAgain: "Try again",
    orderNow: "Order Now", vibePrompt: "What are you hungry for?",
    visionTitle: "GEMINI VISION v3.0", calories: "Calories",
    estPrice: "Est. Price", mainIngredients: "Main Ingredients",
    allGood: "All good", pointAnalyze: "Point to analyze",
    start: "Start",
    exclusive: "✨ Exclusive",
    personalize: "Customize:",
    add: "Add",
    time: "Time",
    emptyCart: "Your cart is empty.",
    itemAdded: "added to order.",
    currency: "$"
  },
  'es-ES': {
    menu: "Menú", create: "Crear", cart: "Pedido", search: "Buscar...",
    starters: "Entradas", mains: "Platos", drinks: "Bebidas",
    cartTitle: "Tu Pedido", total: "Total", confirm: "Confirmar",
    validating: "Validando Pago...", preauth: "Preautorizando $1.00...",
    ready: "¡Listo!", paymentAuth: "Tu pago está preautorizado.",
    orderFree: "¡Pide lo que quieras!", 
    quote: "\"Cuando se den cuenta de quién eres, tu comida ya estará en la mesa.\"",
    createTitle: "Crear Plato Exclusivo",
    dishCreated: "¡Plato Creado!",
    aiDesc: "El Chef Gemini creó esta receta basada en tu pedido y stock disponible.",
    change: "¿Quieres cambiar algo?",
    changePlaceholder: "Ej: Menos picante, cambiar arroz por ensalada...",
    approve: "Aprobar y Añadir al Menú",
    discard: "Descartar y empezar de nuevo",
    whatEat: "¿Qué quieres comer hoy?",
    describeWish: "Describe tu deseo y nuestro Chef IA creará una receta única.",
    wishPlaceholder: "Ej: Quiero algo ligero con pollo y verduras, pero sin gluten...",
    imgLoaded: "Imagen Cargada", useRef: "Usar foto ref.",
    creating: "El Chef está creando...", createBtn: "Crear Receta Exclusiva",
    ingredients: "Ingredientes Disponibles Hoy",
    interpreter: "Intérprete en Vivo",
    kitchen: "Cocina",
    arAdd: "Añadir al Pedido", arAdded: "¡Añadido!",
    arPrompt: "Apunta a la mesa para ver el plato",
    scan: "Leyendo QR...", simulate: "Simular Éxito",
    vibeMatch: "VIBE MATCH", vibeDetected: "Vibe Detectada",
    chefSuggests: "El Chef sugiere:", tryAgain: "Intentar de nuevo",
    orderNow: "Pedir Ahora", vibePrompt: "¿Qué hambre tienes hoy?",
    visionTitle: "GEMINI VISION v3.0", calories: "Calorías",
    estPrice: "Precio Est.", mainIngredients: "Ingredientes Principales",
    allGood: "Todo bien", pointAnalyze: "Apunta para analizar",
    start: "Empezar",
    exclusive: "✨ Exclusivo",
    personalize: "Personalizar:",
    add: "Añadir",
    time: "Tiempo",
    emptyCart: "Tu carrito está vacío.",
    itemAdded: "añadido al pedido.",
    currency: "€"
  },
  'fr-FR': {
    menu: "Menu", create: "Créer", cart: "Panier", search: "Rechercher...",
    starters: "Entrées", mains: "Plats", drinks: "Boissons",
    cartTitle: "Votre Commande", total: "Total", confirm: "Confirmer",
    validating: "Validation du Paiement...", preauth: "Pré-autorisation...",
    ready: "C'est Prêt!", paymentAuth: "Votre paiement est pré-autorisé.",
    orderFree: "Commandez ce que vous voulez!", 
    quote: "\"Au moment où ils réalisent qui vous êtes, votre nourriture est déjà sur la table.\"",
    createTitle: "Créer un Plat Exclusif",
    dishCreated: "Plat Créé!",
    aiDesc: "Le Chef Gemini a créé cette recette basée sur votre demande.",
    change: "Voulez-vous changer quelque chose?",
    changePlaceholder: "Ex: Moins épicé, remplacer le riz par de la salade...",
    approve: "Approuver et Ajouter au Menu",
    discard: "Jeter et recommencer",
    whatEat: "Que voulez-vous manger aujourd'hui?",
    describeWish: "Décrivez votre souhait et notre Chef IA créera une recette unique.",
    wishPlaceholder: "Ex: Je veux quelque chose de léger avec du poulet...",
    imgLoaded: "Image Chargée", useRef: "Utiliser photo ref.",
    creating: "Le Chef crée...", createBtn: "Créer Recette Exclusive",
    ingredients: "Ingrédients Disponibles",
    interpreter: "Interprète en Direct",
    kitchen: "Cuisine",
    arAdd: "Ajouter à la Commande", arAdded: "Ajouté!",
    arPrompt: "Pointez vers la table pour voir le plat",
    scan: "Lecture du QR Code...", simulate: "Simuler Succès",
    vibeMatch: "VIBE MATCH", vibeDetected: "Vibe Détectée",
    chefSuggests: "Le Chef suggère:", tryAgain: "Réessayer",
    orderNow: "Commander", vibePrompt: "Quelle est votre faim?",
    visionTitle: "GEMINI VISION v3.0", calories: "Calories",
    estPrice: "Prix Est.", mainIngredients: "Ingrédients Principaux",
    allGood: "Tout bon", pointAnalyze: "Pointez pour analyser",
    start: "Commencer",
    exclusive: "✨ Exclusif",
    personalize: "Personnaliser:",
    add: "Ajouter",
    time: "Temps",
    emptyCart: "Votre panier est vide.",
    itemAdded: "ajouté à la commande.",
    currency: "€"
  }
};

// Fallback to English for other langs
const getTranslations = (lang: string) => TRANSLATIONS[lang] || TRANSLATIONS['en-US'];

// --- NEW LUXURY LOGO COMPONENT ---
const DJamboLogo: React.FC<{ size?: 'sm' | 'lg', light?: boolean }> = ({ size = 'lg', light = false }) => {
  const isLg = size === 'lg';
  const textColor = light ? 'text-djambo-blue' : 'text-white';
  
  return (
    <div className={`flex items-center ${isLg ? 'gap-3' : 'gap-2'}`}>
      <div className={`relative flex items-center justify-center ${isLg ? 'w-14 h-14' : 'w-9 h-9'} bg-djambo-gold rounded-tl-2xl rounded-br-2xl shadow-lg border-2 border-white/20`}>
         <ChefHat size={isLg ? 32 : 20} className="text-djambo-blue drop-shadow-sm" strokeWidth={2.5} />
         <Sparkles size={isLg ? 16 : 10} className="text-white absolute -top-1 -right-1 animate-pulse" fill="currentColor" />
      </div>
      <div className="flex flex-col items-start">
        <h1 className={`font-serif font-bold tracking-tight leading-none ${textColor} ${isLg ? 'text-4xl' : 'text-2xl'}`}>
          DJambo
        </h1>
        {isLg && <span className="text-[10px] tracking-[0.2em] text-djambo-gold font-sans uppercase opacity-90">Food & AI</span>}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('LANDING');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>({
    accessibilityMode: 'NONE',
    language: 'pt-BR',
    highContrast: false,
    allergies: ['amendoim']
  });
  
  const t = getTranslations(prefs.language);

  // Define styles early to prevent ReferenceError in sub-components
  const autismSafeClass = prefs.accessibilityMode === 'AUTISM' ? 'motion-reduce:transition-none !animate-none' : 'animate-fade-in-up';
  const autismBgClass = prefs.accessibilityMode === 'AUTISM' ? 'bg-[#f0f4f8]' : 'bg-gray-100';

  // Data
  const [menuItems, setMenuItems] = useState<Dish[]>(MOCK_MENU);
  const [customDishes, setCustomDishes] = useState<Dish[]>([]);
  const [arDish, setArDish] = useState<Dish | null>(null);
  
  // Image Generation State
  const [isPersonalizingImages, setIsPersonalizingImages] = useState(false);
  
  // Custom Dish State
  const [customDishPrompt, setCustomDishPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDish, setGeneratedDish] = useState<Dish | null>(null);
  const [refinementText, setRefinementText] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Food Analysis State
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [foodAnalysisResult, setFoodAnalysisResult] = useState<any | null>(null);

  // Vibe Match State
  const [analyzingVibe, setAnalyzingVibe] = useState(false);
  const [vibeResult, setVibeResult] = useState<any | null>(null);

  // Chat/Interaction State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  
  // Payment/Order State
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'confirmed'>('idle');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Menu UI State
  const [activeCategory, setActiveCategory] = useState(t.mains); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslatingMenu, setIsTranslatingMenu] = useState(false);

  // Interpreter State
  const [interpreterMessages, setInterpreterMessages] = useState<{from: 'user'|'staff', text: string, translated: string}[]>([]);
  const [isRecordingUser, setIsRecordingUser] = useState(false);
  const [isRecordingStaff, setIsRecordingStaff] = useState(false);
  
  // Voice Confirmation State
  const [pendingDish, setPendingDish] = useState<Dish | null>(null);

  // -- Sound & Haptic Helper --
  const triggerHaptic = (pattern: number | number[] = 10) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  };

  const playTone = (type: 'success' | 'pop' | 'alert') => {
    if (prefs.accessibilityMode === 'DEAF') return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); 
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1); 
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        triggerHaptic([50, 50, 50]); 
    } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        triggerHaptic(10); 
    } else if (type === 'alert') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.setValueAtTime(880, now + 0.15);
        gain2.gain.setValueAtTime(0.05, now + 0.15);
        gain2.gain.linearRampToValueAtTime(0, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.1);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.25);
        triggerHaptic([100, 50, 100]); 
    }
  };

  const announce = (text: string, type: 'success' | 'pop' | 'alert' = 'pop') => {
    playTone(type);
    
    if (prefs.accessibilityMode !== 'DEAF' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = prefs.language; 
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = (onResult: (text: string) => void, lang: string = prefs.language) => {
    triggerHaptic(50);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = lang; 
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
            triggerHaptic(20);
        };
        
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    } else {
        alert("Reconhecimento de voz não suportado neste navegador.");
    }
  };

  useEffect(() => {
    const initLocation = async () => {
        if (!navigator.geolocation) {
            triggerPersonalization(undefined, undefined);
            return;
        }
        
        navigator.geolocation.getCurrentPosition(async (pos) => {
            triggerPersonalization(pos.coords.latitude, pos.coords.longitude);
        }, (err) => {
            triggerPersonalization(undefined, undefined);
        });
    };
    
    const triggerPersonalization = async (lat?: number, lng?: number) => {
        const needsPersonalization = menuItems.some(i => i.image.includes('picsum'));
        
        if (needsPersonalization && !isPersonalizingImages) {
            setIsPersonalizingImages(true);
            
            try {
                const personalizedDishes = await personalizeMenuImages(menuItems, lat, lng);
                setMenuItems(personalizedDishes);
            } catch (e) {
                console.error("Personalization error", e);
            } finally {
                setIsPersonalizingImages(false);
            }
        }
    };
    
    initLocation();
  }, []); 

  useEffect(() => {
      const updateMenuLanguage = async () => {
          if (prefs.language === 'pt-BR') {
              setMenuItems(prev => prev.map(d => ({...d, translatedName: undefined, translatedDescription: undefined})));
              setCustomDishes(prev => prev.map(d => ({...d, translatedName: undefined, translatedDescription: undefined})));
              return;
          }
          
          setIsTranslatingMenu(true);
          try {
              const translatedBase = await translateMenuBatch(menuItems, prefs.language);
              setMenuItems(translatedBase);
              
              if (customDishes.length > 0) {
                  const translatedCustom = await translateMenuBatch(customDishes, prefs.language);
                  setCustomDishes(translatedCustom);
              }
          } catch (e) {
              console.error("Translation fail", e);
          } finally {
              setIsTranslatingMenu(false);
          }
      };

      updateMenuLanguage();
  }, [prefs.language]);


  const handleVoiceCommand = (text: string) => {
      const cmd = text.toLowerCase();
      
      if (pendingDish) {
          if (cmd.includes('confirmar') || cmd.includes('yes') || cmd.includes('sim')) {
              addToCart(pendingDish);
              setPendingDish(null);
              announce(t.itemAdded, 'success');
          } else {
              setPendingDish(null);
              announce("Cancelado.", 'pop');
          }
          return;
      }

      if (cmd.includes('cardápio') || cmd.includes('menu')) {
          setMode('MENU');
          announce(t.menu, 'pop');
      }
      else if (cmd.includes('criar') || cmd.includes('create')) {
          setMode('CREATE_DISH');
          announce(t.create, 'pop');
      }
      else if (cmd.includes('carrinho') || cmd.includes('pedido')) {
          setMode('CART');
          const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
          announce(`${t.cartTitle}. ${t.total} ${total} ${t.currency}`, 'success');
      }
      else if (cmd.includes('traduzir') || cmd.includes('intérprete')) {
          setMode('TRANSLATOR');
          announce(t.interpreter, 'pop');
      }
      else if (cmd.includes('vibe') || cmd.includes('foto')) {
          setMode('VIBE_MATCH');
          announce(t.vibeMatch, 'pop');
      }
  };

  const handleStart = () => { setMode('SCANNING'); announce(t.scan, 'pop'); };
  
  const handleScanSuccess = () => {
    setMode('AUTH');
    setTimeout(() => {
        setLoadingPayment(true);
        setTimeout(() => {
            setLoadingPayment(false);
            setMode('MENU');
            announce(t.ready, 'success');
        }, 3000);
    }, 1500);
  };

  const addToCart = (dish: Dish, selectedOptions: DishOption[] = []) => {
    setCart(prev => {
      const optionsKey = selectedOptions.map(o => o.name).sort().join('|');
      const cartId = `${dish.id}-${optionsKey}`;
      const existing = prev.find(i => i.cartId === cartId);
      
      if (existing) {
        return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...dish, quantity: 1, selectedOptions: selectedOptions, cartId: cartId }];
    });
    announce(`${dish.translatedName || dish.name} ${t.itemAdded}`, 'success');
  };

  const handleDishSelect = (dish: Dish) => {
    triggerHaptic(20);
    if (prefs.accessibilityMode === 'BLIND') {
        announce(`${t.confirm}?`, 'pop');
        setPendingDish(dish);
    } else {
        // In visual mode, DishCard handles the add click, this is mostly for voice flow
        addToCart(dish);
    }
  };
  
  const handleViewAR = (dish: Dish) => {
      setArDish(dish);
      setMode('AR_PREVIEW');
      announce(`${t.arPrompt}`, 'pop');
  };

  const handleConfirmOrder = () => {
      setOrderStatus('confirmed');
      announce(t.ready, 'success');
      triggerHaptic([50, 50, 200]);
      
      setTimeout(() => {
          setCart([]);
          setOrderStatus('idle');
          setMode('MENU');
          
          setTimeout(() => {
              setNotification(t.quote); // Using quote as placeholder for "order ready" message translation
              announce(t.quote, 'alert');
              setTimeout(() => setNotification(null), 5000);
          }, 5000);
      }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              setReferenceImage(reader.result as string);
              announce(t.imgLoaded, 'pop');
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCreateDish = async (isRefinement = false) => {
    const promptToUse = isRefinement ? refinementText : customDishPrompt;
    if (!promptToUse.trim() && !referenceImage) return;
    
    setIsGenerating(true);
    announce(t.creating, 'pop');
    
    try {
      const base64Img = referenceImage ? referenceImage.split(',')[1] : undefined;
      const newDish = await generateCustomDish(promptToUse, prefs.allergies, isRefinement ? undefined : base64Img, isRefinement ? generatedDish! : undefined);

      if (newDish) {
        setGeneratedDish(newDish);
        if (prefs.language !== 'pt-BR') {
             const [translated] = await translateMenuBatch([newDish], prefs.language);
             setGeneratedDish(translated);
        }
        setCustomDishPrompt(''); 
        setRefinementText('');
        if (isRefinement) announce(t.dishCreated, 'success');
      }
    } catch (e) {
      console.error(e);
      announce("Error", 'alert');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmGeneratedDish = () => {
      if (generatedDish) {
          setCustomDishes(prev => [generatedDish, ...prev]);
          setGeneratedDish(null);
          setReferenceImage(null);
          setMode('MENU');
          announce(t.dishCreated, 'success');
      }
  };

  const handleInterpreterUserSpeak = () => {
      startListening(async (text) => {
          setIsRecordingUser(false);
          const translated = await translateText(text, prefs.language, 'pt-BR');
          setInterpreterMessages(prev => [...prev, { from: 'user', text: text, translated: translated }]);
      }, prefs.language);
      setIsRecordingUser(true);
  };

  const handleInterpreterStaffSpeak = () => {
      startListening(async (text) => {
          setIsRecordingStaff(false);
          const translated = await translateText(text, 'pt-BR', prefs.language);
          setInterpreterMessages(prev => [...prev, { from: 'staff', text: text, translated: translated }]);
      }, 'pt-BR');
      setIsRecordingStaff(true);
  };
  
  const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;
      const newMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputMessage, timestamp: new Date() };
      setChatMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      try {
          const history = chatMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
          const responseText = await chatWithChef(history, newMessage.text, { cart: cart, allergies: prefs.allergies });
          setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText, timestamp: new Date() }]);
      } catch (e) { console.error(e); }
  };
  
  const captureAndAnalyzeVibe = async (videoElement: HTMLVideoElement) => {
      if (!videoElement) return;
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoElement, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
      
      setAnalyzingVibe(true);
      triggerHaptic(50);
      announce(t.creating, 'pop');
      
      try {
          const allDishes = [...customDishes, ...menuItems];
          const result = await analyzeVibe(base64Image, allDishes);
          setVibeResult(result);
          announce(`${t.vibeDetected}: ${result.detectedVibe}`, 'success');
      } catch (e) {
          announce("Error", 'alert');
      } finally {
          setAnalyzingVibe(false);
      }
  };
  
  const captureAndAnalyze = async (videoElement: HTMLVideoElement) => {
      if (!videoElement) return;
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoElement, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
      
      setAnalyzingFood(true);
      triggerHaptic(50);
      announce(t.pointAnalyze, 'pop');
      
      try {
          const result = await identifyDishFromImage(base64Image);
          setFoodAnalysisResult(result);
          announce(`${t.allGood}: ${result.name}`, 'success');
      } catch (e) {
          announce("Error", 'alert');
      } finally {
          setAnalyzingFood(false);
      }
  };

  const LandingView = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-djambo-blue text-white relative overflow-hidden">
      <div className={`absolute inset-0 opacity-10 ${prefs.accessibilityMode === 'AUTISM' ? 'hidden' : "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"}`}></div>
      <div className={`z-10 w-full max-w-md ${autismSafeClass}`}>
        <div className="flex justify-center mb-8">
             <DJamboLogo size="lg" />
        </div>
        <p className="text-xl mb-12 italic font-light text-djambo-gold/80">{t.quote}</p>
        <button onClick={handleStart} className="w-full bg-djambo-gold text-djambo-blue font-bold text-xl py-4 rounded-full shadow-lg flex items-center justify-center gap-3 border-2 border-white/20 hover:scale-105 transition-transform">
          <ScanLine /> {t.start}
        </button>
        <div className="mt-12 flex gap-4 justify-center">
            <button onClick={() => setPrefs(p => ({...p, accessibilityMode: p.accessibilityMode === 'BLIND' ? 'NONE' : 'BLIND'}))} className={`p-4 rounded-full border ${prefs.accessibilityMode === 'BLIND' ? 'bg-djambo-gold text-djambo-blue' : 'border-djambo-gold/30 text-djambo-gold'}`}><Ear /></button>
            <button onClick={() => setPrefs(p => ({...p, accessibilityMode: p.accessibilityMode === 'DEAF' ? 'NONE' : 'DEAF'}))} className={`p-4 rounded-full border ${prefs.accessibilityMode === 'DEAF' ? 'bg-djambo-gold text-djambo-blue' : 'border-djambo-gold/30 text-djambo-gold'}`}><Eye /></button>
            <button onClick={() => setPrefs(p => ({...p, accessibilityMode: p.accessibilityMode === 'AUTISM' ? 'NONE' : 'AUTISM'}))} className={`p-4 rounded-full border ${prefs.accessibilityMode === 'AUTISM' ? 'bg-djambo-gold text-djambo-blue' : 'border-djambo-gold/30 text-djambo-gold'}`}><Accessibility /></button>
        </div>
      </div>
    </div>
  );

  const ScanningView = () => (
      <div className="h-full bg-djambo-darkBlue flex flex-col items-center justify-center text-white">
        <div className="w-64 h-64 border-4 border-djambo-gold rounded-3xl relative flex items-center justify-center animate-pulse">
          <div className="absolute w-full h-1 bg-djambo-gold/50 top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
          <span className="text-djambo-gold font-bold">{t.scan}</span>
        </div>
        <button onClick={handleScanSuccess} className="absolute bottom-12 px-6 py-2 bg-gray-800 rounded-full text-sm border border-gray-600">{t.simulate}</button>
        <style>{`@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }`}</style>
      </div>
  );

  const AuthView = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-djambo-blue text-white text-center">
        {!loadingPayment ? (
            <div className={autismSafeClass}>
                <Loader2 className="w-16 h-16 text-djambo-gold animate-spin mb-6 mx-auto" />
                <h2 className="text-2xl font-serif mb-4 text-djambo-gold font-bold">{t.validating}</h2>
                <p className="text-gray-300">{t.preauth}</p>
            </div>
        ) : (
            <div className={autismSafeClass}>
                <CheckCircle2 className="w-20 h-20 text-djambo-success mx-auto mb-6" />
                <h2 className="text-3xl font-serif mb-4 text-djambo-gold font-bold">{t.ready}</h2>
                <div className="bg-white/10 p-6 rounded-xl border border-djambo-gold/30 mb-8">
                     <p className="text-xl font-bold mb-2 text-djambo-gold">{t.paymentAuth}</p>
                     <p className="text-gray-200">{t.orderFree}</p>
                </div>
                <p className="text-sm italic font-serif opacity-70">{t.quote}</p>
            </div>
        )}
    </div>
  );

  const TranslatorView = () => {
    const currentLang = LANGUAGES.find(l => l.code === prefs.language) || LANGUAGES[1];
    
    return (
      <div className="h-full flex flex-col bg-gray-100">
          <div className="bg-djambo-blue text-white p-4 flex items-center gap-3 shadow-lg">
              <button onClick={() => { setMode('MENU'); announce(t.menu, 'pop'); }}><ChevronLeft /></button>
              <h2 className="font-serif font-bold text-lg flex-1">{t.interpreter}</h2>
              <Globe className="text-djambo-gold" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {interpreterMessages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10 opacity-60">
                      <ArrowLeftRight size={48} className="mx-auto mb-4" />
                      <p>...</p>
                  </div>
              )}
              {interpreterMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.from === 'user' ? 'bg-djambo-blue text-white rounded-br-none' : 'bg-djambo-gold/20 text-djambo-blue border border-djambo-gold/50 rounded-bl-none'}`}>
                          <p className="text-xs font-bold mb-1 opacity-50 uppercase">{msg.from === 'user' ? currentLang.name : t.kitchen}</p>
                          <p className="text-lg font-medium">{msg.text}</p>
                          <div className="h-px bg-current opacity-20 my-2"></div>
                          <p className="text-sm italic opacity-80">{msg.translated}</p>
                      </div>
                  </div>
              ))}
          </div>

          <div className="bg-white p-6 pb-24 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl border-t border-djambo-gold/20 grid grid-cols-2 gap-4">
              <button onClick={handleInterpreterUserSpeak} className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all active:scale-95 ${isRecordingUser ? 'bg-red-500 text-white shadow-inner' : 'bg-djambo-blue text-white'}`}>
                  <div className="text-3xl mb-2">{currentLang.flag}</div>
                  <Mic size={24} className={isRecordingUser ? 'animate-pulse' : ''} />
                  <span className="text-xs font-bold mt-2 uppercase">{currentLang.name}</span>
              </button>
              <button onClick={handleInterpreterStaffSpeak} className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all active:scale-95 ${isRecordingStaff ? 'bg-red-500 text-white shadow-inner' : 'bg-orange-50 text-orange-800 border-2 border-orange-100'}`}>
                  <div className="text-3xl mb-2">🇧🇷</div>
                  <Mic size={24} className={isRecordingStaff ? 'animate-pulse' : ''} />
                  <span className="text-xs font-bold mt-2 uppercase">{t.kitchen}</span>
              </button>
          </div>
      </div>
    );
  };
  
  const ARPreviewView = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {}
        };
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleARAdd = () => {
        setIsAdded(true);
        addToCart(arDish!); 
        setTimeout(() => { setMode('MENU'); }, 2000); 
    };

    if (!arDish) return null;

    return (
        <div className="h-full bg-black relative flex flex-col">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                <button onClick={() => setMode('MENU')} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md border border-white/20"><X /></button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none perspective-1000">
                <div className={`relative transform-style-3d transition-all duration-1000 ${isAdded ? 'scale-0 opacity-0 translate-y-96' : 'animate-float-slow'}`}>
                    <div className="relative group">
                        <img src={arDish.image} alt={arDish.name} className="w-64 h-64 object-cover rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/80" style={{ transform: 'rotateX(20deg)' }} />
                    </div>
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg whitespace-nowrap border border-djambo-gold/30">
                        <p className="font-bold text-djambo-blue">{arDish.translatedName || arDish.name}</p>
                        <p className="text-xs text-center text-djambo-darkGold font-bold">{t.currency} {arDish.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-8 left-6 right-6 z-20">
                <div className="text-center text-white/80 text-sm mb-4 shadow-black drop-shadow-md">{t.arPrompt}</div>
                <button onClick={handleARAdd} disabled={isAdded} className={`w-full font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 border-2 transition-all duration-500 ${isAdded ? 'bg-green-500 border-green-400 text-white scale-105' : 'bg-djambo-gold text-djambo-blue border-white/20'}`}>
                    {isAdded ? <CheckCircle2 size={20} /> : <ShoppingBag size={20} />} 
                    {isAdded ? t.arAdded : t.arAdd}
                </button>
            </div>
            <style>{` .perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } @keyframes float-slow { 0%, 100% { transform: translateY(0) rotateX(10deg); } 50% { transform: translateY(-15px) rotateX(10deg); } } .animate-float-slow { animation: float-slow 4s ease-in-out infinite; } `}</style>
        </div>
    );
  };

  const VibeMatchView = () => {
      const videoRef = useRef<HTMLVideoElement>(null);
      useEffect(() => {
          const startCamera = async () => {
              try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                  if (videoRef.current) videoRef.current.srcObject = stream;
              } catch (err) {}
          };
          startCamera();
          return () => {
              if (videoRef.current && videoRef.current.srcObject) {
                  const stream = videoRef.current.srcObject as MediaStream;
                  stream.getTracks().forEach(track => track.stop());
              }
          };
      }, []);

      return (
          <div className="h-full bg-black relative flex flex-col">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover mirror-mode" style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-transparent to-black/80 pointer-events-none"></div>
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
                  <button onClick={() => setMode('MENU')} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md border border-white/20"><X /></button>
                  <div className="flex items-center gap-2 bg-djambo-blue/80 px-4 py-1.5 rounded-full border border-djambo-gold/30 backdrop-blur-md shadow-lg">
                       <Wand2 size={16} className="text-djambo-gold animate-pulse" />
                       <span className="text-white font-bold text-sm">{t.vibeMatch}</span>
                  </div>
              </div>
              {vibeResult && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl animate-fade-in-up z-30 pb-24">
                      <div className="flex justify-center -mt-12 mb-4">
                          <div className="w-16 h-16 bg-djambo-blue rounded-full flex items-center justify-center shadow-xl border-4 border-white"><Sparkles size={32} className="text-djambo-gold" /></div>
                      </div>
                      <div className="text-center mb-6">
                          <h3 className="text-xs font-bold text-djambo-blue uppercase tracking-widest mb-1">{t.vibeDetected}</h3>
                          <p className="text-2xl font-serif font-bold text-gray-800">"{vibeResult.detectedVibe}"</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                          <p className="text-sm text-gray-600 italic text-center mb-4">"{vibeResult.reasoning}"</p>
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                              <div className="p-2 bg-djambo-blue/10 rounded-full text-djambo-blue"><ChefHat size={20} /></div>
                              <div><p className="text-xs text-gray-500">{t.chefSuggests}</p><p className="font-bold text-djambo-blue">{vibeResult.suggestedDishName}</p></div>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setVibeResult(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">{t.tryAgain}</button>
                          <button className="flex-1 bg-djambo-blue text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2" onClick={() => { 
                                const dish = [...menuItems, ...customDishes].find(d => d.name === vibeResult.suggestedDishName);
                                if (dish) { addToCart(dish); setMode('MENU'); } else { announce("Error", 'alert'); }
                            }}><ShoppingBag size={18} /> {t.orderNow}</button>
                      </div>
                  </div>
              )}
              {!vibeResult && (
                  <div className="absolute bottom-24 left-0 right-0 z-20 flex flex-col items-center justify-center">
                      <p className="text-white font-bold text-lg mb-8 drop-shadow-md">{t.vibePrompt}</p>
                      {analyzingVibe ? <Loader2 size={40} className="text-white animate-spin" /> : <button onClick={() => captureAndAnalyzeVibe(videoRef.current!)} className="w-20 h-20 rounded-full bg-white border-4 border-djambo-gold shadow-[0_0_50px_rgba(255,215,0,0.6)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95"><Camera size={32} className="text-djambo-blue" /></button>}
                  </div>
              )}
          </div>
      );
  };

  const FoodAnalysisView = () => {
      const videoRef = useRef<HTMLVideoElement>(null);
      useEffect(() => {
          const startCamera = async () => {
              try {
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  if (videoRef.current) videoRef.current.srcObject = stream;
              } catch (err) {}
          };
          startCamera();
          return () => {
              if (videoRef.current && videoRef.current.srcObject) {
                  const stream = videoRef.current.srcObject as MediaStream;
                  stream.getTracks().forEach(track => track.stop());
              }
          };
      }, []);

      return (
          <div className="h-full bg-black relative flex flex-col">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
                  <button onClick={() => setMode('MENU')} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md border border-white/20"><X /></button>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-djambo-gold/30 backdrop-blur-sm"><ScanEye size={16} className="text-djambo-gold animate-pulse" /><span className="text-white font-mono text-xs text-djambo-gold">{t.visionTitle}</span></div>
              </div>
              {foodAnalysisResult && (
                  <div className="absolute top-24 left-4 right-4 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-[0_0_50px_rgba(26,35,126,0.4)] animate-fade-in-up border border-djambo-gold/30 z-30">
                      <div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-djambo-blue">{foodAnalysisResult.name}</h3><button onClick={() => setFoodAnalysisResult(null)} className="p-1 bg-gray-100 rounded-full"><X size={14}/></button></div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{foodAnalysisResult.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-orange-50 p-2 rounded-lg border border-orange-100"><span className="block text-[10px] text-gray-500 uppercase tracking-wider">{t.calories}</span><span className="font-bold text-orange-700">{foodAnalysisResult.calories}</span></div>
                           <div className="bg-green-50 p-2 rounded-lg border border-green-100"><span className="block text-[10px] text-gray-500 uppercase tracking-wider">{t.estPrice}</span><span className="font-bold text-green-700">{t.currency} {foodAnalysisResult.price}</span></div>
                      </div>
                      <button className="w-full bg-djambo-blue text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2" onClick={() => { announce(t.allGood, "success"); setMode('MENU'); }}><CheckCircle2 size={18} /> {t.allGood}</button>
                  </div>
              )}
              <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center justify-center">
                  {!foodAnalysisResult && <p className="text-white/80 text-sm mb-8 font-light tracking-wide bg-black/40 px-4 py-1 rounded-full">{t.pointAnalyze}</p>}
                  {analyzingFood ? <div className="relative"><div className="w-20 h-20 rounded-full border-4 border-djambo-gold/30 animate-ping absolute inset-0"></div><div className="w-20 h-20 rounded-full bg-white flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(255,215,0,0.5)] z-10"><Loader2 size={40} className="text-djambo-blue animate-spin" /></div></div> : <button onClick={() => captureAndAnalyze(videoRef.current!)} className="w-20 h-20 rounded-full bg-white border-4 border-djambo-gold shadow-[0_0_40px_rgba(255,215,0,0.3)] flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group"><ScanEye size={32} className="text-djambo-blue group-hover:scale-110 transition-transform" /></button>}
              </div>
          </div>
      );
  };
  
  const ChatDrawer = () => (
    <div className={`fixed inset-0 bg-black/60 z-50 flex justify-end transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="p-4 bg-djambo-blue text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-2"><div className="p-1.5 bg-djambo-gold rounded-full text-djambo-blue"><ChefHat size={20} /></div><h2 className="text-lg font-serif font-bold">Chef Virtual</h2></div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                 <div className="flex justify-center"><div className="bg-blue-100 text-djambo-blue text-[10px] px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1"><BrainCircuit size={12} /><span>Contexto Ativo: {cart.length} itens</span></div></div>
                 {chatMessages.map(msg => (<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-djambo-blue text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>{msg.text}</div></div>))}
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2"><input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 bg-gray-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-djambo-gold" onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} /><button onClick={handleSendMessage} className="p-3 bg-djambo-gold text-djambo-blue rounded-full hover:scale-105 transition-transform"><Send size={20} /></button></div>
            </div>
        </div>
    </div>
  );

  const CreateDishView = () => (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      <div className="bg-djambo-blue p-4 text-white flex items-center gap-3 shadow-lg">
        <button onClick={() => setMode('MENU')}><ChevronLeft /></button>
        <h2 className="font-serif font-bold text-lg">{t.createTitle}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {generatedDish ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl text-djambo-blue text-sm mb-4 border border-blue-100"><p className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-djambo-gold"/> {t.dishCreated}</p><p>{t.aiDesc}</p></div>
            <DishCard dish={generatedDish} onAdd={() => {}} prefs={prefs} labels={{exclusive: t.exclusive, personalize: t.personalize, add: t.add, time: t.time}} />
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">{t.change}</p>
                <div className="flex gap-2"><input type="text" value={refinementText} onChange={(e) => setRefinementText(e.target.value)} placeholder={t.changePlaceholder} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-djambo-gold" /><button onClick={() => handleCreateDish(true)} disabled={isGenerating} className="p-2 bg-gray-200 rounded-lg text-gray-600"><RefreshCw size={20} className={isGenerating ? "animate-spin" : ""} /></button></div>
            </div>
            <button onClick={confirmGeneratedDish} className="w-full bg-djambo-gold text-djambo-blue font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"><CheckCircle2 /> {t.approve}</button>
            <button onClick={() => setGeneratedDish(null)} className="w-full text-gray-500 py-2 text-sm">{t.discard}</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <ChefHat size={48} className="text-djambo-gold mb-4 mx-auto" /><h3 className="text-center font-bold text-djambo-blue text-lg mb-2">{t.whatEat}</h3><p className="text-center text-gray-500 text-sm mb-6">{t.describeWish}</p>
                <textarea value={customDishPrompt} onChange={(e) => setCustomDishPrompt(e.target.value)} placeholder={t.wishPlaceholder} className="w-full h-32 bg-gray-50 rounded-xl p-4 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-djambo-gold mb-4 resize-none" />
                <div className="flex items-center gap-4 mb-6"><label className="flex-1 h-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-djambo-gold hover:text-djambo-gold transition-colors"><ImagePlus size={20} /><span className="text-xs font-bold">{referenceImage ? t.imgLoaded : t.useRef}</span><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label><button onClick={() => startListening((text) => setCustomDishPrompt(prev => prev + " " + text))} className="h-12 w-12 bg-djambo-blue text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Mic /></button></div>
                <button onClick={() => handleCreateDish(false)} disabled={(!customDishPrompt && !referenceImage) || isGenerating} className="w-full bg-djambo-blue text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">{isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="text-djambo-gold" />}{isGenerating ? t.creating : t.createBtn}</button>
            </div>
            <div className="px-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">{t.ingredients}</p><div className="flex flex-wrap justify-center gap-2 opacity-60">{["Frango", "Cogumelos", "Arroz", "Salmão"].map(i => (<span key={i} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{i}</span>))}</div></div>
          </div>
        )}
      </div>
    </div>
  );

  const MenuView = () => (
    <div className={`pb-24 flex flex-col h-full ${autismBgClass} relative`}>
      {prefs.accessibilityMode === 'BLIND' && (<div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"><button onClick={() => startListening(handleVoiceCommand)} className={`flex items-center gap-2 bg-djambo-blue text-white px-6 py-4 rounded-full shadow-2xl border-2 border-djambo-gold font-bold text-lg animate-pulse`}><Mic size={24} /></button></div>)}
      <div className="bg-djambo-blue px-4 pt-6 pb-4 shadow-xl z-20 sticky top-0">
          <div className="flex justify-between items-center mb-4">
              <DJamboLogo size="sm" />
              <div className="flex gap-2">
                  <div className="relative group"><button className="p-2 rounded-full border border-white/20 text-white flex items-center gap-1 hover:bg-white/10"><span className="text-lg">{LANGUAGES.find(l => l.code === prefs.language)?.flag}</span></button><div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block animate-fade-in z-50 border border-gray-100">{LANGUAGES.map(lang => (<button key={lang.code} onClick={() => { setPrefs(p => ({...p, language: lang.code})); announce("OK", 'pop'); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${prefs.language === lang.code ? 'bg-djambo-blue/10 text-djambo-blue font-bold' : 'text-gray-700'}`}><span>{lang.flag}</span>{lang.name}</button>))}</div></div>
                  <button onClick={() => startListening(handleVoiceCommand)} className={`p-2 text-djambo-gold hover:bg-white/10 rounded-full ${isListening ? 'bg-red-500/20 text-red-400' : ''}`}><Mic size={20} /></button><button onClick={() => setIsChatOpen(true)} className="p-2 text-djambo-gold hover:bg-white/10 rounded-full"><MessageSquare size={20} /></button><button onClick={() => { setMode('TRANSLATOR'); announce(t.interpreter, 'pop'); }} className="p-2 text-djambo-gold hover:bg-white/10 rounded-full"><Languages size={20} /></button><button onClick={() => { setMode('VIBE_MATCH'); announce(t.vibeMatch, 'pop'); }} className="p-2 text-djambo-gold hover:bg-white/10 rounded-full border border-djambo-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.3)] animate-pulse"><Wand2 size={20} /></button>
              </div>
          </div>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-djambo-gold" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search} className="w-full bg-djambo-blue text-white border border-djambo-gold rounded-full pl-9 pr-4 py-2 text-sm placeholder-djambo-gold/50 focus:outline-none focus:ring-1 focus:ring-djambo-gold" /></div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4 no-scrollbar">
            {[{ name: t.starters, icon: <Utensils size={16} /> }, { name: t.mains, icon: <ChefHat size={16} /> }, { name: t.drinks, icon: <Wine size={16} /> }].map((cat) => (<button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors border ${activeCategory === cat.name ? 'bg-djambo-gold text-djambo-blue border-djambo-gold' : 'bg-white text-gray-500 border-gray-200'}`}><span className={activeCategory === cat.name ? 'text-djambo-blue' : 'text-djambo-darkGold'}>{cat.icon}</span>{cat.name}</button>))}
        </div>
        {isTranslatingMenu ? (<div className="flex flex-col items-center justify-center py-20 text-gray-400"><Loader2 className="animate-spin mb-2" size={32} /><p>Translating...</p></div>) : (<div className="grid grid-cols-1 gap-6 pb-20">{isPersonalizingImages && (<div className="text-center py-4 bg-djambo-blue/10 rounded-xl border border-djambo-blue/20 animate-pulse mb-4"><Loader2 className="animate-spin inline-block mr-2 text-djambo-blue" size={16} /><span className="text-sm font-bold text-djambo-blue">Personalizing...</span></div>)}{customDishes.map(dish => <DishCard key={dish.id} dish={dish} onAdd={handleDishSelect} onViewAR={handleViewAR} prefs={prefs} labels={{exclusive: t.exclusive, personalize: t.personalize, add: t.add, time: t.time}} />)}{menuItems.map(dish => <DishCard key={dish.id} dish={dish} onAdd={handleDishSelect} onViewAR={handleViewAR} prefs={prefs} labels={{exclusive: t.exclusive, personalize: t.personalize, add: t.add, time: t.time}} />)}</div>)}
      </div>
      <button onClick={() => { setMode('CREATE_DISH'); announce(t.create, 'pop'); }} className="fixed bottom-24 right-6 bg-djambo-gold text-djambo-blue font-bold px-6 py-4 rounded-full shadow-2xl z-40 flex items-center gap-2 border-2 border-white animate-bounce-slow hover:scale-105"><Sparkles size={20} /> {t.create}</button>
    </div>
  );

  // Cart Drawer
  const CartDrawer = () => (
    <div className={`fixed inset-0 bg-black/60 z-50 flex justify-end transition-opacity duration-300 ${mode === 'CART' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${mode === 'CART' ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 bg-djambo-blue text-white flex justify-between items-center shadow-lg"><h2 className="text-2xl font-serif font-bold">{t.cartTitle}</h2><button onClick={() => setMode('MENU')} className="p-2 hover:bg-white/10 rounded-full"><X /></button></div>
            {orderStatus === 'confirmed' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50"><div className="w-24 h-24 bg-djambo-success rounded-full flex items-center justify-center mb-6 animate-bounce-slow text-white shadow-xl"><CheckCircle2 size={48} /></div><h3 className="text-xl font-bold text-djambo-blue mb-2">Pedido Enviado!</h3></div>
            ) : (
                <>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-2">
                            <img src={item.image} className="w-16 h-16 object-cover rounded-lg" alt={item.name} />
                            <div className="flex-1">
                                <h4 className="font-bold text-djambo-blue text-sm">{item.translatedName || item.name}</h4>
                                {item.selectedOptions && item.selectedOptions.length > 0 && (<div className="flex flex-wrap gap-1 mt-1">{item.selectedOptions.map(opt => (<span key={opt.name} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{opt.name}</span>))}</div>)}
                                <div className="flex justify-between items-center mt-2"><span className="text-xs text-gray-500">x{item.quantity}</span><span className="font-bold text-djambo-darkGold">{t.currency} {((item.price + (item.selectedOptions?.reduce((sum, o) => sum + o.price, 0) || 0)) * item.quantity).toFixed(2)}</span></div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-gray-400 mt-10">{t.emptyCart}</p>}
                </div>
                <div className="p-6 bg-white border-t border-gray-200">
                    <div className="flex justify-between text-xl font-bold text-djambo-blue mb-6"><span>{t.total}</span><span>{t.currency} {cart.reduce((acc, item) => acc + ((item.price + (item.selectedOptions?.reduce((sum, o) => sum + o.price, 0) || 0)) * item.quantity), 0).toFixed(2)}</span></div>
                    <button onClick={handleConfirmOrder} disabled={cart.length === 0} className="w-full bg-djambo-gold text-djambo-blue py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-105 disabled:opacity-50"><CheckCircle2 /> {t.confirm}</button>
                </div>
                </>
            )}
        </div>
    </div>
  );

  if (mode === 'LANDING') return <LandingView />;
  if (mode === 'SCANNING') return <ScanningView />;
  if (mode === 'AUTH') return <AuthView />;
  if (mode === 'TRANSLATOR') return <TranslatorView />;
  if (mode === 'CAMERA_TRANSLATE') return <CameraTranslateView />;
  if (mode === 'AR_PREVIEW') return <ARPreviewView />;
  if (mode === 'FOOD_ANALYSIS') return <FoodAnalysisView />;
  if (mode === 'VIBE_MATCH') return <VibeMatchView />;

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center ${prefs.highContrast ? 'contrast-125' : ''}`}>
      <div className="w-full max-w-md h-[100dvh] bg-white shadow-2xl relative overflow-hidden flex flex-col md:rounded-3xl md:h-[90vh] md:border-8 md:border-gray-900">
        {notification && (<div className="absolute top-24 left-4 right-4 bg-djambo-success text-white p-4 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-fade-in-up border-2 border-white"><BellRing className="text-djambo-gold" /><p className="font-bold text-sm">{notification}</p></div>)}
        <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {mode === 'MENU' && <MenuView />}
            {mode === 'CREATE_DISH' && <CreateDishView />}
            {mode === 'CHAT' && <TranslatorView />} 
        </div>
        <ChatDrawer />
        <div className="h-20 bg-djambo-blue flex items-center justify-around px-2 relative z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <button onClick={() => { setMode('MENU'); announce(t.menu, 'pop'); }} className={`flex flex-col items-center p-2 rounded-lg transition-all w-16 ${mode === 'MENU' ? 'text-djambo-gold' : 'text-gray-400'}`}><Utensils size={24} /><span className="text-[10px] mt-1">{t.menu}</span></button>
            <button onClick={() => { setMode('CREATE_DISH'); announce(t.create, 'pop'); }} className={`flex flex-col items-center p-2 rounded-lg transition-all w-16 ${mode === 'CREATE_DISH' ? 'text-djambo-gold' : 'text-gray-400'}`}><ChefHat size={24} /><span className="text-[10px] mt-1">{t.create}</span></button>
            <div className="relative -top-6"><button onClick={() => { setMode('TRANSLATOR'); announce(t.interpreter, 'pop'); }} className="bg-djambo-gold text-djambo-blue p-4 rounded-full shadow-lg border-4 border-white hover:scale-110 transition-transform"><Languages size={28} /></button></div>
            <div className="w-16"></div>
            <button onClick={() => { setMode('CART'); announce(`${t.cartTitle}`, 'success'); }} className={`flex flex-col items-center p-2 rounded-lg transition-all w-16 ${mode === 'CART' ? 'text-djambo-gold' : 'text-gray-400'}`}><ShoppingBag size={24} /><span className="text-[10px] mt-1">{t.cart}</span></button>
        </div>
        {mode === 'CART' && <CartDrawer />}
      </div>
    </div>
  );
};

export default App;