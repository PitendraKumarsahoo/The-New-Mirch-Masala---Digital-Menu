import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { AdminMenuItem } from '../../types/admin';
import { MenuEditorModal } from '../components/MenuEditorModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface AdminMenuViewProps {
  menu: AdminMenuItem[];
  onSaveItem: (item: Omit<AdminMenuItem, 'id'> & { id?: string }) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onToggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  onTogglePopular: (id: string, isPopular: boolean) => Promise<void>;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const AdminMenuView: React.FC<AdminMenuViewProps> = ({
  menu,
  onSaveItem,
  onDeleteItem,
  onToggleAvailability,
  onTogglePopular,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'AVAILABLE' | 'OUT_OF_STOCK'>('ALL');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState<AdminMenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories list derived from current menu
  const categories = useMemo(() => {
    const set = new Set<string>();
    menu.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [menu]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      if (dietaryFilter === 'VEG' && !item.isVeg) return false;
      if (dietaryFilter === 'NON_VEG' && item.isVeg) return false;

      if (stockFilter === 'AVAILABLE' && item.isAvailable === false) return false;
      if (stockFilter === 'OUT_OF_STOCK' && item.isAvailable !== false) return false;

      return true;
    });
  }, [menu, searchQuery, selectedCategory, dietaryFilter, stockFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: AdminMenuItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await onDeleteItem(deletingItem.id);
      setDeletingItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            <span>Menu & Pricing Management</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Manage food dishes, toggle live availability, configure prices and mark Chef Specials.
          </p>
        </div>

        <button
          id="admin-add-dish-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dish name, spice, or category..."
              className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="ALL">All Categories ({menu.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Veg/Dietary Filter */}
          <div className="flex gap-2">
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="ALL">All Dietary</option>
              <option value="VEG">🌱 Pure Veg</option>
              <option value="NON_VEG">🍗 Non-Veg</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="ALL">Stock: All</option>
              <option value="AVAILABLE">Available</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Quick count indicator */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
          <span>
            Showing <strong className="text-stone-200">{filteredMenu.length}</strong> of {menu.length} items
          </span>
          {(searchQuery || selectedCategory !== 'ALL' || dietaryFilter !== 'ALL' || stockFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setDietaryFilter('ALL');
                setStockFilter('ALL');
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Menu Items Table / Cards */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/50 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Dish</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Veg</th>
                <th className="py-3 px-4 font-semibold text-center">Available</th>
                <th className="py-3 px-4 font-semibold text-center">Popular</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-200">
              {filteredMenu.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No menu items matched your search.</p>
                    <p className="text-xs mt-1">Try adjusting the filter criteria or add a new dish.</p>
                  </td>
                </tr>
              ) : (
                filteredMenu.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-850/50 transition-colors ${
                      item.isAvailable === false ? 'opacity-65 bg-stone-950/20' : ''
                    }`}
                  >
                    {/* Dish Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-800 shrink-0 bg-stone-950 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <UtensilsCrossed className="w-4 h-4 text-stone-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-100 truncate text-sm">{item.name}</p>
                          {item.description && (
                            <p className="text-[11px] text-stone-400 truncate max-w-xs sm:max-w-sm">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-mono">
                        <span className="font-bold text-white text-sm">₹{item.price}</span>
                        {item.secondaryPrice && (
                          <span className="text-stone-400 text-xs ml-1">/ ₹{item.secondaryPrice}</span>
                        )}
                      </div>
                    </td>

                    {/* Veg indicator */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded border ${
                          item.isVeg
                            ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                            : 'border-red-600 bg-red-950/40 text-red-400'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-red-400'}`}
                        />
                      </span>
                    </td>

                    {/* Availability Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                        title={item.isAvailable ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          item.isAvailable ? 'bg-emerald-500' : 'bg-stone-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.isAvailable ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Popular Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onTogglePopular(item.id, !item.isPopular)}
                        title={item.isPopular ? 'Marked as Chef Special' : 'Click to feature as Popular'}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          item.isPopular
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-stone-600 hover:text-stone-400'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Dish"
                          className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          title="Delete Dish"
                          className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <MenuEditorModal
        isOpen={isEditorOpen || isAddModalOpen}
        item={editingItem}
        onClose={() => {
          setIsEditorOpen(false);
          if (onCloseAddModal) onCloseAddModal();
        }}
        onSave={onSaveItem}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingItem}
        title="Delete Menu Item"
        message={`Are you sure you want to remove "${deletingItem?.name}" from the menu catalog? This will remove it from the customer ordering view.`}
        confirmText="Delete Item"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
