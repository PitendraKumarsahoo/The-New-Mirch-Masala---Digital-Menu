import React from 'react';
import { motion } from 'motion/react';
import {
  OrderStatus,
  ORDER_STATUS_STEPS,
  PlacedOrder,
} from '../../services/orderHistoryService';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  Utensils,
  Sparkles,
} from 'lucide-react';

interface OrderStatusStepperProps {
  order: PlacedOrder;
  compact?: boolean;
  onAdvanceStep?: () => void;
  showStaffControls?: boolean;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  order,
  compact = false,
  onAdvanceStep,
  showStaffControls = false,
}) => {
  const currentStatusIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.status === order.status
  );

  const getStepIcon = (status: OrderStatus, isPassed: boolean, isCurrent: boolean) => {
    if (isPassed && !isCurrent) {
      return <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />;
    }

    switch (status) {
      case 'received':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
        return <BellRing className="w-4 h-4" />;
      case 'completed':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = () => {
    if (currentStatusIndex === -1) return 0;
    if (currentStatusIndex === 0) return 12;
    if (currentStatusIndex === 1) return 40;
    if (currentStatusIndex === 2) return 72;
    return 100;
  };

  return (
    <div className="w-full space-y-3">
      {/* Progress Track Bar */}
      <div className="relative px-2 pt-2">
        {/* Background Grey Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-stone-200 rounded-full" />

        {/* Dynamic Progress Fill Line */}
        <motion.div
          className="absolute top-6 left-6 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `calc(${getProgressPercentage()}% - 12px)` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* 4 Step Circles */}
        <div className="relative flex justify-between items-start">
          {ORDER_STATUS_STEPS.map((step, idx) => {
            const isPassed = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            // Find matching timeline timestamp
            const timelineItem = order.timeline?.find((t) => t.status === step.status);
            const stepTime = timelineItem
              ? new Date(timelineItem.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null;

            return (
              <div
                key={step.status}
                className="flex flex-col items-center text-center max-w-[72px]"
              >
                {/* Circle Icon Indicator */}
                <div className="relative">
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-orange-500 pointer-events-none"
                    />
                  )}

                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
                      isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow-orange-500/30'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {getStepIcon(step.status, isPassed, isCurrent)}
                  </div>
                </div>

                {/* Step Label */}
                <div className="mt-2 space-y-0.5">
                  <p
                    className={`text-[10px] font-bold leading-tight ${
                      isCurrent
                        ? 'text-orange-700 font-extrabold'
                        : isPassed
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {compact ? step.shortLabel : step.label}
                  </p>
                  {stepTime && (
                    <span className="text-[9px] text-stone-400 block font-mono">
                      {stepTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Description Card */}
      {!compact && currentStatusIndex >= 0 && (
        <div className="bg-orange-50/80 rounded-2xl p-3 border border-orange-200/70 text-left flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            {getStepIcon(order.status, false, true)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-950">
                {ORDER_STATUS_STEPS[currentStatusIndex].label}
              </span>
              <span className="text-[9px] font-bold bg-orange-200/70 text-orange-800 px-1.5 py-0.5 rounded-full">
                Step {currentStatusIndex + 1} of 4
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
              {ORDER_STATUS_STEPS[currentStatusIndex].description}
            </p>
          </div>
        </div>
      )}

      {/* Staff Quick Action / Simulator Control */}
      {showStaffControls && order.status !== 'completed' && onAdvanceStep && (
        <div className="bg-stone-900 text-white rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-stone-300">
              Restaurant Staff / Demo Action:
            </span>
          </div>
          <button
            type="button"
            onClick={onAdvanceStep}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-xs"
          >
            {order.status === 'received'
              ? 'Mark In Kitchen →'
              : order.status === 'preparing'
              ? 'Mark Ready to Serve →'
              : 'Mark Served & Complete ✓'}
          </button>
        </div>
      )}
    </div>
  );
};
