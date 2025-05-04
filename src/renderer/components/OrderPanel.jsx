import React from 'react';
import { ShoppingCart, XCircle, Trash2 } from 'lucide-react';

// Single order line item
function OrderItem({ name, quantity, price, onRemove }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200">
      {/* Item info */}
      <div className="flex-1">
        <p className="text-[#1D150B] font-medium">{name}</p>
        <p className="text-sm text-gray-500">Qty: {quantity}</p>
      </div>

      {/* Price */}
      <p className="w-20 text-right text-[#1D150B] font-medium">${(price * quantity).toFixed(2)}</p>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label={`Remove ${name}`}
      >
        <Trash2 className="h-5 w-5 text-red-500" />
      </button>
    </div>
  );
}

// Order panel on right side
export default function OrderPanel({ items = [], onPlaceOrder, onCancel, onRemoveItem }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <aside className=" right-0 top-0 h-screen w-80 bg-[#F9F9F9] text-[#1D150B] shadow-2xl flex flex-col">
      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold">Order</h2>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {items.map((item, idx) => (
          <OrderItem
            key={`${item.name}-${idx}`}
            name={item.name}
            quantity={item.quantity}
            price={item.price}
            onRemove={() => onRemoveItem(idx)}
          />
        ))}
      </div>

      {/* Total and actions */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-xl font-semibold">${total.toFixed(2)}</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onPlaceOrder}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#ED6827] text-white font-medium hover:bg-[#d95a23] transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Place Order</span>
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg bg-white text-[#1D150B] border border-[#ED6827] font-medium hover:bg-[#FFEDE3] transition-colors"
          >
            <XCircle className="h-5 w-5 text-[#ED6827]" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </aside>
  );
}