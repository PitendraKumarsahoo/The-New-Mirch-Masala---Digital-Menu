import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Check,
  Save,
  Building,
  Lock,
} from 'lucide-react';
import { AdminRestaurantSettings } from '../../types/admin';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminSettingsViewProps {
  settings: AdminRestaurantSettings;
  onSaveSettings: (settings: AdminRestaurantSettings) => Promise<void>;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const { isOwner, hasPermission } = useAdminAuth();
  const canUpdateSettings = isOwner || hasPermission('settings.update');

  const [formData, setFormData] = useState<AdminRestaurantSettings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof AdminRestaurantSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);
    try {
      await onSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>Restaurant Profile & Operational Settings</span>
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          Manage core restaurant information displayed across customer menus and Google review prompts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-800">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Store Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Restaurant Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Tagline / Cuisine Specialization
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Indian • Chinese • Biryani • Tandoori"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Location & Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours Card */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Operating Hours</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Opening Time
              </label>
              <input
                type="text"
                value={formData.openingTime}
                onChange={(e) => handleChange('openingTime', e.target.value)}
                placeholder="11:00 AM"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Closing Time
              </label>
              <input
                type="text"
                value={formData.closingTime}
                onChange={(e) => handleChange('closingTime', e.target.value)}
                placeholder="10:30 PM"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Online Presence & Google Review URL */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stone-800">
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Google Review Link & Redirection</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Google Maps Review URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={formData.googleReviewUrl}
              onChange={(e) => handleChange('googleReviewUrl', e.target.value)}
              placeholder="https://www.google.com/maps/search/?api=1&query=The+New+Mirch+Masala+Gunupur"
              required
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            <p className="text-[11px] text-stone-400 mt-1.5">
              When 4★ or 5★ reviews are submitted by happy diners, they are automatically directed to post their review to this Google Maps page.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
              <Check className="w-4 h-4" />
              Settings saved to Google Sheets!
            </span>
          )}

          {canUpdateSettings ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Google Sheets...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Restaurant Settings</span>
                </>
              )}
            </button>
          ) : (
            <div className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Settings configuration is restricted to Restaurant Owners</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
