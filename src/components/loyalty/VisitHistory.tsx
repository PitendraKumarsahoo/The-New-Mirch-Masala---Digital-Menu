import React from 'react';
import { ShieldCheck, Calendar, Clock, Info } from 'lucide-react';
import { Visit } from '../../types';

interface VisitHistoryProps {
  visits: Visit[];
}

export const VisitHistory: React.FC<VisitHistoryProps> = ({ visits }) => {
  return (
    <div id="visit-history-card" className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900">Verified Visit History</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
          {visits.length} {visits.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-6 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No verified visits recorded yet</p>
          <p className="text-xs text-stone-500 mt-0.5 max-w-xs mx-auto">
            When you dine at The New Mirch Masala, ask your server to verify your visit.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {visits.map((visit) => (
            <div key={visit.visitId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{visit.visitDate}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{visit.visitTime || 'Dine-in'}</span>
                    <span>•</span>
                    <span>Verified by {visit.verifiedBy || 'Staff'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anti-Fraud / 1 Visit Per Day Notice */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-stone-800">Fair Visit Policy:</span> A maximum of 1 verified visit is counted per customer per calendar day (Asia/Kolkata).
        </p>
      </div>
    </div>
  );
};
