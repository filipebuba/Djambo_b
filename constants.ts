import { Dish } from './types';

export const MOCK_MENU: Dish[] = [
  {
    id: '1',
    name: 'Muamba de Galinha',
    description: 'Prato tradicional angolano com galinha, quiabo e óleo de palma. Rico em sabores e história.',
    price: 45.00,
    time: '25 min',
    image: 'https://picsum.photos/400/300?random=1',
    tags: ['gluten-free'],
    calories: '580 kcal',
    rating: 4.8,
    options: [
      { name: 'Extra Quiabo', price: 5.00 },
      { name: 'Pimenta Malagueta (Extra Forte)', price: 0.00 },
      { name: 'Porção Extra de Funge', price: 8.00 }
    ]
  },
  {
    id: '2',
    name: 'Risoto de Cogumelos Selvagens',
    description: 'Arroz arbóreo cremoso com mix de cogumelos frescos, finalizado com azeite trufado.',
    price: 52.90,
    time: '20 min',
    image: 'https://picsum.photos/400/300?random=2',
    tags: ['vegetarian', 'gluten-free'],
    calories: '450 kcal',
    rating: 4.7,
    options: [
      { name: 'Extra Parmesão', price: 6.00 },
      { name: 'Azeite Trufado Extra', price: 4.50 }
    ]
  },
  {
    id: '3',
    name: 'Salmão Grelhado',
    description: 'Filé de salmão fresco grelhado com ervas finas, acompanhado de legumes no vapor.',
    price: 68.00,
    time: '15 min',
    image: 'https://picsum.photos/400/300?random=3',
    tags: ['gluten-free', 'lactose-free'],
    calories: '380 kcal',
    rating: 4.9,
    options: [
      { name: 'Trocar Legumes por Salada', price: 0.00 },
      { name: 'Molho de Alcaparras', price: 3.00 }
    ]
  },
  {
    id: '4',
    name: 'Mousse de Maracujá Real',
    description: 'Sobremesa aerada e doce na medida certa, com calda de maracujá fresco.',
    price: 18.00,
    time: '5 min',
    image: 'https://picsum.photos/400/300?random=4',
    tags: ['vegetarian', 'gluten-free'],
    calories: '220 kcal',
    rating: 5.0
  }
];

export const AVAILABLE_INGREDIENTS = [
  "frango", "carne bovina", "peixe", "camarão", "tofú",
  "arroz", "massa penne", "batata", "quinoa",
  "tomate", "cebola", "alho", "espinafre", "cenoura", "cogumelos",
  "creme de leite", "queijo parmesão", "leite de coco", "azeite de dendê",
  "pimenta", "manjericão", "curry", "páprica"
];