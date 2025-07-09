import React from 'react';
import { ShoppingCart, XCircle, Trash2 } from 'lucide-react';

// Single order line item
function OrderItem({ name, quantity, price, onRemove }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200">
      {/* Item info */}
      <div className="flex-1">
        <p className="text-[#1D150B] font-medium">{name}</p>
        <p className="text-sm text-gray-500">Quantité : {quantity}</p>
      </div>

      {/* Price */}
      <p className="w-20 text-right text-[#1D150B] font-medium">{price * quantity} D.A</p>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="ml-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label={`Supprimer ${name}`}
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
        <h2 className="text-2xl font-semibold">Commande</h2>
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
          <span className="text-lg font-medium">Total :</span>
          <span className="text-xl font-semibold">{total} D.A</span>
        </div>
        <div className="flex gap-4 space-x-4">
          <button
            onClick={onPlaceOrder}
            className="flex-1 flex flex-col items-center justify-center space-x-2 py-3 rounded-lg bg-[#4E71FF] text-white font-medium hover:bg-[#5409DA] transition-colors"
          >
            <ShoppingCart className="h-8 w-8" />
            {/* <span className='text-xs'>Passer la commande</span> */}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg bg-white text-[#1D150B] border border-[#4E71FF] font-medium hover:bg-[#FFEDE3] transition-colors"
          >
            <XCircle className="h-8 w-8 text-[#4E71FF]" />
            {/* <span>Annuler</span> */}
          </button>
        </div>
      </div>
    </aside>
  );
}
