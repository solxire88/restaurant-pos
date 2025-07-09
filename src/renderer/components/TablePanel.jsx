// src/components/TablePanel.jsx
import React, { useEffect, useState } from 'react';
import { Ticket, UtensilsCrossed, Receipt, CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function TableSummaryModal({
  table,
  onClose,
  reload}) {
  const total = table.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleFinish = async () => {
    // Increment daily total by this table's bill
    await window.api.incrementDailyTotal(total);
    // Increment order count
    // await window.api.incrementOrderCount();
    await window.api.deleteTableOrder(table.id);
    reload();

    onClose();
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-h-[80vh] overflow-y-auto relative"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <h2 className="text-2xl font-bold mb-4 text-[#1D150B]">
            Résumé de la table {table.tableNumber}
          </h2>

          {/* Itemized list */}
          <ul className="space-y-2 mb-6">
            {table.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-base">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>
                  {(item.price * item.quantity).toFixed(2)} D.A
                </span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="flex justify-between items-center font-semibold text-lg mb-6">
            <span>Total :</span>
            <span className="text-[#4E71FF]">{total.toFixed(2)} D.A</span>
          </div>

          {/* Three print buttons side-by-side */}
          <div className="flex gap-3 mb-6">
            <motion.button
              onClick={() => window.api.printTableTicket(table.tableNumber, table.count)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#4E71FF] text-white py-3 rounded-lg text-sm font-medium"
            >
              <Ticket size={18} />
              Ticket Table
            </motion.button>

            <motion.button
              onClick={() => window.api.printTableChef(table.tableNumber, table.items, table.count)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-gray-200 text-[#1D150B] py-3 rounded-lg text-sm font-medium"
            >
              <UtensilsCrossed size={18} />
              Ticket Cuisine
            </motion.button>

            <motion.button
              onClick={() => window.api.printTableCustomer(table.tableNumber, table.items, table.count)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-gray-200 text-[#1D150B] py-3 rounded-lg text-sm font-medium"
            >
              <Receipt size={18} />
              Ticket Client
            </motion.button>
          </div>

          {/* Finish Payment full-width */}
          <motion.button
            onClick={handleFinish}
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

export default function TablePanel({}) {
  const [selected, setSelected] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    reload();
  }, []);

  // helper to reload
  const reload = async () => {
    const data = await window.api.fetchTableOrders();
    setTables(data || []);
    console.log('Tables fetched:', data);
  };


  return (
    <>
      <aside className="w-80 bg-[#F9F9F9] p-6 flex flex-col shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-[#1D150B]">
          Tables occupées
        </h2>

        <ul className="flex-1 space-y-4 overflow-y-auto mb-6">
          {tables.map((t, idx) => (
            <motion.li
              key={idx}
              onClick={() => setSelected({ ...t, idx })}
              whileTap={{ scale: 0.97 }}
              className="
                flex justify-between items-center bg-white rounded-lg p-4
                shadow-sm cursor-pointer hover:shadow-md transition-shadow
              "
            >
              <span className="font-medium text-lg">
                Table {t.tableNumber}
              </span>
              <span className="text-[#4E71FF] font-semibold">
                {t.bill} D.A
              </span>
            </motion.li>
          ))}
        </ul>

      </aside>

      {/* Summary Modal */}
      {selected && (
        <TableSummaryModal
          table={selected}
          onClose={() => setSelected(null)}
          reload = {reload}
        />
      )}
    </>
  );
}
