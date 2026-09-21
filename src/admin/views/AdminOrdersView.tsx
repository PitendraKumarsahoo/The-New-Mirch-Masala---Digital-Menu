import React, { useState } from 'react';
import {
  usePlacedOrders,
  PlacedOrder,
  OrderStatus,
  ORDER_STATUS_STEPS,
  createPlacedOrder,
} from '../../services/orderHistoryService';
import { OrderStatusStepper } from '../../components/orders/OrderStatusStepper';
import { VegBadge } from '../../components/VegBadge';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  BellRing,
  Utensils,
  Filter,
  Plus,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Table as TableIcon,
  ShoppingBag,
} from 'lucide-react';

export const AdminOrdersView: React.FC = () => {
  const {
    orders,
    activeOrders,
    completedOrders,
    updateStatus,
    advanceStep,
    deleteOrder,
  } = usePlacedOrders();

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Order Received
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
            <ChefHat className="w-3 h-3" />
            In Kitchen
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-xs">
            <BellRing className="w-3 h-3 animate-bounce" />
            Ready to Serve
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-stone-800 text-stone-400 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Served & Completed
          </span>
        );
      default:
        return null;
    }
  };

  // Quick Demo Simulator to test staff receiving an order
  const handleCreateDemoOrder = () => {
    const tableNums = ['Table 2', 'Table 4', 'Table 6', 'Family Table 8'];
    const randomTable = tableNums[Math.floor(Math.random() * tableNums.length)];
    createPlacedOrder({
      tableNumber: randomTable,
      items: [
        {
          id: 'starter-paneer-tikka',
          name: 'Paneer Tikka Angara',
          price: 260,
          quantity: 2,
          isVeg: true,
        },
        {
          id: 'main-dal-makhani',
          name: 'Dal Makhani Special',
          price: 210,
          quantity: 1,
          isVeg: true,
        },
        {
          id: 'bread-butter-naan',
          name: 'Butter Garlic Naan',
          price: 45,
          quantity: 3,
          isVeg: true,
        },
      ],
      subtotalPrice: 865,
      grandTotalPrice: 865,
      spiceLevel: 'medium',
      specialInstructions: 'Customer requested crisp naans and mint chutney',
      channel: 'website',
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Stats Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 text-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Live Kitchen Display & Orders</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Real-Time Sync
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any step button below to instantly advance order status in diner&apos;s browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateDemoOrder}
            className="py-2.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Incoming Order</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-stone-950 font-black'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('received')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'received'
              ? 'bg-amber-500 text-stone-950 font-black'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          1. Received ({orders.filter((o) => o.status === 'received').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('preparing')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'preparing'
              ? 'bg-amber-500 text-stone-950 font-black'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          2. In Kitchen ({orders.filter((o) => o.status === 'preparing').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('ready')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'ready'
              ? 'bg-amber-500 text-stone-950 font-black'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          3. Ready to Serve ({orders.filter((o) => o.status === 'ready').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-amber-500 text-stone-950 font-black'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          4. Completed ({completedOrders.length})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-200">No orders found</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {statusFilter === 'all'
                ? 'No table orders placed yet. Diners who tap &quot;Send Order to Kitchen&quot; on the website will appear here in real-time.'
                : `No orders currently matching "${statusFilter}".`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateDemoOrder}
            className="py-2 px-4 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Test Table Order</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isActive =
              order.status === 'received' ||
              order.status === 'preparing' ||
              order.status === 'ready';

            return (
              <div
                key={order.orderId}
                className={`bg-stone-900 rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                  order.status === 'ready'
                    ? 'border-emerald-500/60 ring-2 ring-emerald-500/20'
                    : order.status === 'preparing'
                    ? 'border-orange-500/50'
                    : order.status === 'received'
                    ? 'border-amber-500/50'
                    : 'border-stone-800'
                }`}
              >
                {/* Order Top Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          #{order.orderId}
                        </span>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-200 border border-stone-700">
                          {order.tableNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-500" />
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-stone-600">•</span>
                        <span className="text-stone-400 capitalize">{order.channel}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(order.status)}
                      <span className="text-xs font-black text-stone-100">
                        ₹{order.grandTotalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Dishes Itemized List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Dishes ({order.totalPortionsCount} portions)
                    </span>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-stone-950/60 p-2 rounded-xl text-xs border border-stone-800/80"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {typeof item.isVeg === 'boolean' && (
                              <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
                            )}
                            <span className="font-semibold text-stone-200 truncate">
                              {item.name}
                            </span>
                            <span className="text-amber-400 font-mono font-bold text-[11px]">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="text-stone-400 font-mono">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Special Notes */}
                  {(order.spiceLevel || order.specialInstructions) && (
                    <div className="bg-stone-950/40 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                      {order.spiceLevel && (
                        <div className="flex justify-between">
                          <span className="text-stone-500">Spice Preference:</span>
                          <span className="text-amber-400 font-bold capitalize">
                            {order.spiceLevel}
                          </span>
                        </div>
                      )}
                      {order.specialInstructions && (
                        <div>
                          <span className="text-stone-500 font-bold">Notes: </span>
                          <span className="text-stone-300">{order.specialInstructions}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Staff Step Action Buttons */}
                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Staff Step Action</span>
                    <span>Click to Update Diner</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {order.status === 'received' && (
                      <button
                        type="button"
                        onClick={() => advanceStep(order.orderId)}
                        className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-600/20"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Send to Kitchen (Preparing) →</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => advanceStep(order.orderId)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>Mark Ready to Serve 🛎️ →</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => advanceStep(order.orderId)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Served & Complete ✓</span>
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <div className="py-2 px-3 rounded-xl bg-stone-800/80 text-center text-xs text-stone-400 font-medium">
                        ✓ Order Completed & Served
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
