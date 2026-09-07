import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { AdminMenuItem } from '../../types/admin';

interface MenuEditorModalProps {
  isOpen: boolean;
  item: AdminMenuItem | null; // null = creating new item
  onClose: () => void;
  onSave: (itemData: Omit<AdminMenuItem, 'id'> & { id?: string }) => Promise<void>;
}

const COMMON_CATEGORIES = [
  'Soup',
  'Salad',
  'Papad',
  'Pakoda',
  'Roll',
  'Noodles',
  'Fried Rice',
  'Vegetable',
  'Mushroom',
  'Paneer',
  'Chicken',
  'Mutton',
  'Prawn',
  'Fish',
  'Egg',
  'Tandoori',
  'Biryani',
  'Meals',
  'Soft Drinks',
];

export const MenuEditorModal: React.FC<MenuEditorModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chicken');
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [secondaryPrice, setSecondaryPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'Chicken');
      setSubCategory(item.subCategory || '');
      setPrice(item.price ? String(item.price) : '');
      setSecondaryPrice(item.secondaryPrice ? String(item.secondaryPrice) : '');
      setDescription(item.description || '');
      setImage(item.image || '');
      setIsVeg(Boolean(item.isVeg));
      setIsAvailable(item.isAvailable !== false);
      setIsPopular(Boolean(item.isPopular));
    } else {
      setName('');
      setCategory('Chicken');
      setSubCategory('');
      setPrice('');
      setSecondaryPrice('');
      setDescription('');
      setImage('');
      setIsVeg(false);
      setIsAvailable(true);
      setIsPopular(false);
    }
    setErrors({});
  }, [item, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Food item name is required.';
    if (!category.trim()) errs.category = 'Category is required.';

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = 'Please enter a valid price greater than 0.';
    }

    if (secondaryPrice) {
      const parsedSec = parseFloat(secondaryPrice);
      if (isNaN(parsedSec) || parsedSec <= 0) {
        errs.secondaryPrice = 'Secondary price must be a positive number.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: item ? item.id : undefined,
        name: name.trim(),
        category: category.trim(),
        subCategory: subCategory.trim() || undefined,
        price: parseFloat(price),
        secondaryPrice: secondaryPrice ? parseFloat(secondaryPrice) : null,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        isVeg,
        isAvailable,
        isPopular,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {item ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <p className="text-xs text-stone-400">
                {item ? `Item ID: ${item.id}` : 'Create a new dish for The New Mirch Masala catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Food Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Handi Biryani"
              required
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Chef Special, Gravy, Dry"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Price & Secondary Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Regular / Full Price (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="240"
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Secondary / Half Price (₹) (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  value={secondaryPrice}
                  onChange={(e) => setSecondaryPrice(e.target.value)}
                  placeholder="140"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              {errors.secondaryPrice && (
                <p className="text-red-400 text-xs mt-1">{errors.secondaryPrice}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly prepared with authentic Indian spices, herbs, and slow-cooked aroma..."
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Image URL & Preview */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Image URL (Optional)
            </label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {image && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-700 shrink-0 bg-stone-950">
                  <img
                    src={image}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Supports Unsplash, Google Drive, Imgur, or direct CDN image links.
            </p>
          </div>

          {/* Dietary & Status Toggles */}
          <div className="pt-2 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Veg / Non-Veg */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-xs font-medium text-stone-300">
                {isVeg ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
              </span>
              <button
                type="button"
                onClick={() => setIsVeg(!isVeg)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVeg ? 'bg-emerald-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isVeg ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Available Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-xs font-medium text-stone-300">
                {isAvailable ? '✅ Available' : '❌ Out of Stock'}
              </span>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-amber-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Popular Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800">
              <span className="text-xs font-medium text-stone-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isPopular ? 'Popular' : 'Standard'}
              </span>
              <button
                type="button"
                onClick={() => setIsPopular(!isPopular)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPopular ? 'bg-amber-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPopular ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Item...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{item ? 'Save Changes' : 'Create Item'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
