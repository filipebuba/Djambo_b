import React, { useState } from 'react';
import { Dish, UserPreferences, DishOption } from '../types';
import { Plus, Clock, Info, Flame, Star, Box, Cuboid, Check } from 'lucide-react';

interface Props {
  dish: Dish;
  onAdd: (dish: Dish, selectedOptions: DishOption[]) => void;
  onViewAR?: (dish: Dish) => void;
  prefs: UserPreferences;
  labels?: {
    exclusive: string;
    personalize: string;
    add: string;
    time: string;
  };
}

const DishCard: React.FC<Props> = ({ dish, onAdd, onViewAR, prefs, labels }) => {
  const [selectedOptions, setSelectedOptions] = useState<DishOption[]>([]);
  
  // Default labels if not provided
  const text = labels || {
    exclusive: "✨ Exclusivo",
    personalize: "Personalize:",
    add: "Adicionar",
    time: "Tempo"
  };

  // Helper to ensure proper character rendering for translations
  const fixText = (text: string | undefined) => {
    if (!text) return '';
    if (prefs.language !== 'pt-BR') {
        try {
            if (/[ÃÂ]/.test(text)) {
                return decodeURIComponent(escape(text));
            }
        } catch (e) {
            return text;
        }
    }
    return text;
  };
  
  const displayName = fixText(dish.translatedName || dish.name);
  const displayDescription = fixText(dish.translatedDescription || dish.description);

  const totalPrice = dish.price + selectedOptions.reduce((sum, opt) => sum + opt.price, 0);

  const toggleOption = (option: DishOption) => {
    if (selectedOptions.some(o => o.name === option.name)) {
      setSelectedOptions(selectedOptions.filter(o => o.name !== option.name));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const speakDish = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const optionsText = selectedOptions.length > 0 
        ? `Com ${selectedOptions.map(o => o.name).join(' e ')}.` 
        : '';
        
      const utterance = new SpeechSynthesisUtterance(
        `${displayName}: ${displayDescription}. ${optionsText} Preço total: ${Math.floor(totalPrice)}. ${text.time}: ${dish.time}.`
      );
      utterance.lang = prefs.language || 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const isAutismMode = prefs.accessibilityMode === 'AUTISM';

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full ${isAutismMode ? 'shadow-none border-2 border-gray-200' : 'transform hover:scale-[1.02]'}`}>
      <div className="relative h-48 bg-gray-200 group">
        <img 
          src={dish.image} 
          alt={displayName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        {dish.isCustom && (
          <div className="absolute top-3 right-3 bg-djambo-gold text-djambo-blue px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20 flex items-center gap-1">
            {text.exclusive}
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 text-white w-full pr-4">
             <h3 className="font-serif text-xl font-bold leading-tight drop-shadow-md mb-1">{displayName}</h3>
             <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={12} 
                        fill={i < Math.floor(dish.rating) ? "#FFD700" : "none"} 
                        className={i < Math.floor(dish.rating) ? "text-djambo-gold" : "text-gray-400"} 
                    />
                 ))}
                 <span className="text-xs ml-1 text-djambo-gold font-bold">{dish.rating.toFixed(1)}</span>
             </div>
        </div>

        {onViewAR && (
          <button 
            onClick={(e) => { e.stopPropagation(); onViewAR(dish); }}
            className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors border border-white/20"
            title="AR View"
          >
            <Box size={18} className="text-djambo-gold" />
          </button>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start mb-3">
            <div className="flex flex-wrap gap-1">
                {dish.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                        {tag}
                    </span>
                ))}
            </div>
            <span className="font-bold text-lg text-djambo-darkGold whitespace-nowrap">
                {/* Simple currency formatting based on lang could be added here, sticking to symbol for now */}
                {prefs.language === 'en-US' ? '$' : 'R$'} {totalPrice.toFixed(2)}
            </span>
        </div>
        
        <p className={`text-gray-600 text-sm mb-4 flex-1 ${isAutismMode ? 'leading-loose' : 'line-clamp-3'}`}>
            {displayDescription}
        </p>

        {dish.options && dish.options.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{text.personalize}</p>
            <div className="flex flex-wrap gap-2">
              {dish.options.map((opt) => {
                const isSelected = selectedOptions.some(o => o.name === opt.name);
                return (
                  <button
                    key={opt.name}
                    onClick={() => toggleOption(opt)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-djambo-blue text-white border-djambo-blue shadow-sm' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-djambo-gold'
                    }`}
                  >
                    {isSelected && <Check size={10} />}
                    {opt.name}
                    {opt.price > 0 && <span className={`ml-1 font-bold ${isSelected ? 'text-djambo-gold' : 'text-gray-400'}`}>+{prefs.language === 'en-US' ? '$' : 'R$'}{opt.price}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-djambo-blue" />
            <span>{dish.time}</span>
          </div>
          {dish.calories && (
            <div className="flex items-center gap-1">
              <Flame size={14} className="text-djambo-alert" />
              <span>{dish.calories}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
            {(prefs.accessibilityMode === 'BLIND' || isAutismMode) && (
                <button 
                onClick={speakDish}
                className="p-3 bg-gray-100 text-djambo-blue rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                aria-label="Speak"
                >
                 <span className="sr-only">Speak</span>
                 🔊
                </button>
            )}
          <button 
            onClick={() => {
              onAdd(dish, selectedOptions);
              setSelectedOptions([]);
            }}
            className="flex-1 bg-djambo-blue text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors active:scale-95 shadow-md border-b-4 border-[#0F165A]"
          >
            <Plus size={18} className="text-djambo-gold" />
            {text.add} {selectedOptions.length > 0 && `(+${selectedOptions.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;