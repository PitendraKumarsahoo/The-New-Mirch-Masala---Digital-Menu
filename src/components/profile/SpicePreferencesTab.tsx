import React, { useState } from 'react';
import {
  CustomerPreferences,
  SpicePreferenceLevel,
  DietaryPreference,
  SPICE_LEVEL_CONFIG,
} from '../../types/profile';
import { Flame, Check, Sparkles, ChefHat, CheckCircle2 } from 'lucide-react';

interface SpicePreferencesTabProps {
  preferences: CustomerPreferences;
  onSavePreferences: (updated: CustomerPreferences) => void;
}

const COMMON_DINING_NOTES = [
  'Less Oil / Low Ghee',
  'Extra Gravy',
  'Crispy Tandoori Roti',
  'Less Salt',
  'Extra Spicy Tadka',
  'Green Chillies on Side',
  'No Ajinomoto',
  'Extra Lemon & Onions',
];

export const SpicePreferencesTab: React.FC<SpicePreferencesTabProps> = ({
  preferences,
  onSavePreferences,
}) => {
  const [selectedSpice, setSelectedSpice] = useState<SpicePreferenceLevel>(
    preferences.spiceLevel || 'medium'
  );
  const [selectedDietary, setSelectedDietary] = useState<DietaryPreference>(
    preferences.dietaryPreference || 'all'
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    preferences.specialInstructions || ''
  );
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleChipToggle = (chip: string) => {
    const trimmed = specialInstructions.trim();
    if (trimmed.includes(chip)) {
      // Remove chip
      const updated = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== chip && s.length > 0)
        .join(', ');
      setSpecialInstructions(updated);
    } else {
      // Add chip
      const updated = trimmed ? `${trimmed}, ${chip}` : chip;
      setSpecialInstructions(updated);
    }
  };

  const handleSave = () => {
    const updated: CustomerPreferences = {
      ...preferences,
      spiceLevel: selectedSpice,
      dietaryPreference: selectedDietary,
      specialInstructions: specialInstructions.trim(),
    };
    onSavePreferences(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      {/* 1. Spice Level Selector */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Preferred Spice Level</h3>
              <p className="text-[11px] text-stone-500">How would you like your gravies & curries?</p>
            </div>
          </div>
          <span className="text-xs font-black text-orange-600">
            {SPICE_LEVEL_CONFIG[selectedSpice].peppers}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {(Object.keys(SPICE_LEVEL_CONFIG) as SpicePreferenceLevel[]).map((level) => {
            const config = SPICE_LEVEL_CONFIG[level];
            const isSelected = selectedSpice === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedSpice(level)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-400'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{config.peppers}</span>
                    <span className="font-bold text-xs text-stone-900">
                      {config.label}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Dietary Preference */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900">Dietary Lifestyle</h3>
          <p className="text-[11px] text-stone-500">Filter your dining recommendations</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'all' as const, label: 'All Foods', icon: '🍽️' },
            { id: 'veg' as const, label: 'Pure Veg', icon: '🌱' },
            { id: 'non-veg' as const, label: 'Non-Veg', icon: '🍗' },
            { id: 'jain' as const, label: 'Jain Friendly', icon: '🌿' },
            { id: 'eggetarian' as const, label: 'Eggetarian', icon: '🥚' },
          ].map((item) => {
            const isSelected = selectedDietary === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDietary(item.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Kitchen Notes & Chef Instructions */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Kitchen & Dining Notes</h3>
            <p className="text-[11px] text-stone-500">Your default requests when dining at Mirch Masala</p>
          </div>
        </div>

        {/* Quick Preference Chips */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
            Quick Cooking Requests
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_DINING_NOTES.map((chip) => {
              const isActive = specialInstructions.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipToggle(chip)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'bg-stone-100 text-stone-600 border border-transparent hover:bg-stone-200/70'
                  }`}
                >
                  {isActive ? '✓ ' : '+ '}
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Additional Notes for Kitchen Staff
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g., Please make gravies with low oil, rotis well-roasted, no raw onions..."
            rows={3}
            className="w-full text-xs p-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
          />
        </div>
      </section>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-orange-400" />
        <span>Save Dining Preferences</span>
      </button>
    </div>
  );
};
