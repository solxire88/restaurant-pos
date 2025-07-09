// components/OrderSummaryModal.jsx
import React from 'react';
import { X, Printer, Clipboard, CreditCard, ChefHat, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderSummaryModal({
  items,
  onClose,
  onFinishPayment,
  onPrintCustomer,
  onPrintChef
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-h-[85vh] overflow-y-auto relative"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <h2 className="text-3xl font-bold mb-6 text-[#1D150B]">
            Résumé de la commande
          </h2>

          {/* Items */}
          <ul className="space-y-4 mb-6">
            {items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-lg">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{(item.price * item.quantity).toFixed(2)} D.A</span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="flex justify-between items-center font-semibold text-2xl mb-8">
            <span>Total :</span>
            <span>{total} D.A</span>
          </div>

          {/* Print buttons side-by-side */}
          <div className="flex gap-4 mb-6">
            <motion.button
              onClick={onPrintCustomer}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#4E71FF] text-white py-3 rounded-lg text-sm font-medium"
            >
              <Receipt size={18} />
              Ticket Client
            </motion.button>

            <motion.button
              onClick={onPrintChef}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-[#1D150B] py-3 rounded-lg text-sm font-medium"
            >
              <ChefHat size={18} />
              Ticket Cuisine
            </motion.button>
          </div>

          {/* Finish Payment full-width */}
          <motion.button
            onClick={onFinishPayment}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg text-lg font-semibold"
          >
            <CreditCard size={20} />
            Terminer le paiement
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
