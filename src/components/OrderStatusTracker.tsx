import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  OrderStatus,
  ORDER_STATUS_STEPS,
  PlacedOrder,
} from '../services/orderHistoryService';
import {
  Clock,
  ChefHat,
  BellRing,
  Utensils,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
  Timer,
} from 'lucide-react';

export interface OrderStatusTrackerProps {
  order: PlacedOrder;
  compact?: boolean;
  onAdvanceStep?: () => void;
  onSelectStatus?: (status: OrderStatus) => void;
  onViewDetails?: () => void;
  onDismiss?: () => void;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  showControls?: boolean;
  className?: string;
}

const STEP_COLORS: Record<
  OrderStatus,
  {
    bg: string;
    text: string;
    border: string;
    activeGlow: string;
  }
> = {
  received: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-300',
    activeGlow: 'shadow-amber-500/30',
  },
  preparing: {
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    border: 'border-orange-300',
    activeGlow: 'shadow-orange-500/30',
  },
  ready: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    activeGlow: 'shadow-emerald-500/30',
  },
  completed: {
    bg: 'bg-stone-800',
    text: 'text-stone-700',
    border: 'border-stone-400',
    activeGlow: 'shadow-stone-800/30',
  },
  cancelled: {
    bg: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-rose-300',
    activeGlow: 'shadow-rose-500/30',
  },
};

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order,
  compact = false,
  onAdvanceStep,
  onSelectStatus,
  onViewDetails,
  onDismiss,
  isSimulating = false,
  onToggleSimulation,
  showControls = true,
  className = '',
}) => {
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex(
    (s) => s.status === order.status
  );

  // Elapsed time tracker
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const createdTime = new Date(order.createdAt).getTime();
    return Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const createdTime = new Date(order.createdAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - createdTime) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Progress percentage calculation: 15% -> 45% -> 75% -> 100%
  const getProgressPercentage = () => {
    switch (order.status) {
      case 'received':
        return 16;
      case 'preparing':
        return 48;
      case 'ready':
        return 80;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getStepIcon = (status: OrderStatus, isPassed: boolean, isCurrent: boolean) => {
    if (isPassed && !isCurrent) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />;
    }
    switch (status) {
      case 'received':
        return <Clock className="w-3.5 h-3.5" />;
      case 'preparing':
        return <ChefHat className="w-3.5 h-3.5" />;
      case 'ready':
        return <BellRing className="w-3.5 h-3.5" />;
      case 'completed':
        return <Utensils className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const currentStepInfo = ORDER_STATUS_STEPS[currentStepIndex] || ORDER_STATUS_STEPS[0];

  if (compact) {
    return (
      <div
        id={`order-status-tracker-compact-${order.orderId}`}
        className={`bg-stone-900 text-stone-100 rounded-2xl p-3 shadow-xl border border-stone-800 ${className}`}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="absolute w-4 h-4 rounded-full bg-orange-500/30 animate-ping" />
            </div>
            <span className="text-xs font-mono font-bold text-orange-400">
              #{order.orderId}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
              {order.tableNumber}
            </span>
            <span className="text-xs font-black text-white truncate">
              {currentStepInfo.shortLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="text-[11px] font-bold text-stone-400 hover:text-white px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="View full order details"
              >
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Compact Progress Bar Track */}
        <div className="space-y-1.5">
          <div className="relative h-2 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full"
              initial={false}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </div>

          {/* 4 Step Clickable Markers (State Toggles) */}
          <div className="grid grid-cols-4 gap-1 text-center pt-0.5">
            {ORDER_STATUS_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.status}
                  type="button"
                  onClick={() => onSelectStatus && onSelectStatus(step.status)}
                  disabled={!onSelectStatus}
                  title={`Toggle status to ${step.shortLabel}`}
                  className={`text-[10px] font-bold py-1 px-1 rounded-md transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-orange-500/20 text-orange-400 font-black border border-orange-500/40'
                      : isPassed
                      ? 'text-emerald-400 hover:bg-stone-800/80'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {isPassed && !isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                    )}
                    <span>{step.shortLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`order-status-tracker-${order.orderId}`}
      className={`bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-lg p-4 sm:p-5 text-left space-y-4 ${className}`}
    >
      {/* Top Header Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
              #{order.orderId}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
              {order.tableNumber}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
              <Timer className="w-3 h-3 text-stone-500" />
              <span>Active {formatElapsed(elapsedSeconds)}</span>
            </span>
          </div>

          <div className="pt-1">
            <h4 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
              {currentStepInfo.label}
            </h4>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              {currentStepInfo.description}
            </p>
          </div>
        </div>

        {/* Right Action: Details / Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className="text-xs font-bold text-stone-700 hover:text-stone-950 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Items</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              title="Close tracker"
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Visual Progress Bar & 4 Step Node Indicators */}
      <div className="relative pt-2 pb-1 px-1">
        {/* Background Track Line */}
        <div className="absolute top-6 left-6 right-6 h-1.5 bg-stone-100 rounded-full" />

        {/* Animated Gradient Fill Bar */}
        <motion.div
          className="absolute top-6 left-6 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full"
          initial={false}
          animate={{ width: `calc(${getProgressPercentage()}% - 12px)` }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />

        {/* 4 Clickable Step Nodes (Received, Preparing, Ready, Served) */}
        <div className="relative flex justify-between items-start">
          {ORDER_STATUS_STEPS.map((step, idx) => {
            const isPassed = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            // Find timeline entry
            const timelineItem = order.timeline?.find((t) => t.status === step.status);
            const stepTime = timelineItem
              ? new Date(timelineItem.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null;

            return (
              <button
                key={step.status}
                type="button"
                onClick={() => onSelectStatus && onSelectStatus(step.status)}
                title={`Click to toggle step to ${step.shortLabel}`}
                className="flex flex-col items-center text-center max-w-[80px] group focus:outline-hidden cursor-pointer"
              >
                {/* Node Circle */}
                <div className="relative">
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -inset-1 rounded-full bg-orange-400/40 pointer-events-none"
                    />
                  )}

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white ring-4 ring-orange-100 scale-110 font-bold'
                        : isPassed
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'bg-white border-2 border-stone-200 text-stone-400 group-hover:border-stone-400'
                    }`}
                  >
                    {getStepIcon(step.status, isPassed, isCurrent)}
                  </div>
                </div>

                {/* Step Label */}
                <span
                  className={`text-[11px] font-bold mt-2 leading-tight transition-colors ${
                    isCurrent
                      ? 'text-orange-600 font-black'
                      : isPassed
                      ? 'text-stone-800'
                      : 'text-stone-400 group-hover:text-stone-600'
                  }`}
                >
                  {step.shortLabel}
                </span>

                {/* Timestamp or Step Info */}
                <span className="text-[10px] text-stone-400 mt-0.5 font-mono">
                  {stepTime || (idx === 0 ? 'Placed' : `Step ${idx + 1}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Order Status Workflow & State Toggles */}
      {showControls && (
        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulated Order Workflow</span>
            </div>

            {/* Auto-simulation timer toggle */}
            {onToggleSimulation && (
              <button
                type="button"
                onClick={onToggleSimulation}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                  isSimulating
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
                title={
                  isSimulating
                    ? 'Auto-advancing through Received -> Preparing -> Ready -> Served'
                    : 'Click to start automatic time-based step progression'
                }
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3 h-3 fill-emerald-700" />
                    <span>Auto-Simulating ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-stone-700" />
                    <span>Start Auto-Progress</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Direct State Toggle Chips (Received, Preparing, Ready, Served) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-600 uppercase tracking-wider">
              <span>Quick State Toggles:</span>
              <span>Click any step to set status</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ORDER_STATUS_STEPS.map((step) => {
                const isActive = order.status === step.status;
                return (
                  <button
                    key={`toggle-${step.status}`}
                    type="button"
                    onClick={() => onSelectStatus && onSelectStatus(step.status)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border ${
                      isActive
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    {step.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advance Step Action Button */}
          {order.status !== 'completed' && onAdvanceStep && (
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={onAdvanceStep}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-black active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Advance to Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              </button>

              {onSelectStatus && (
                <button
                  type="button"
                  onClick={() => onSelectStatus('received')}
                  className="py-2 px-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Reset order status to Received"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          )}

          {order.status === 'completed' && onSelectStatus && (
            <div className="pt-1 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-xs text-emerald-800">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Order Fully Served & Enjoyed!
              </span>
              <button
                type="button"
                onClick={() => onSelectStatus('received')}
                className="text-[11px] font-bold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-simulate</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
