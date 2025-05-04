// src/pages/DineInPage.jsx
import React, { useState } from 'react';
import { Table } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/SideBar';
import TablePanel from '../components/TablePanel';
import TableOrderPage from './TableOrderPage';

// mock table list
const allTables = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  tableNumber: i + 1,
}));

export default function DineInPage() {
  const [currentTable, setCurrentTable] = useState(null);
  // finished orders: store tableNumber, items[], and bill total
  const [completedOrders, setCompletedOrders] = useState([]);

  const handleTableClick = (tbl) => setCurrentTable(tbl);
  const handleCancelOrder = () => setCurrentTable(null);

  const handleCompleteOrder = ({ tableNumber, items, total }) => {
    setCompletedOrders(prev => [
      ...prev,
      { tableNumber, items, bill: total }
    ]);
    setCurrentTable(null);
  };

  const handleRemoveTable = idx => {
    setCompletedOrders(prev => prev.filter((_, i) => i !== idx));
  };

  // If taking an order, show TableOrderPage
  if (currentTable) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <TableOrderPage
          table={currentTable}
          onComplete={handleCompleteOrder}
          onCancel={handleCancelOrder}
        />
      </div>
    );
  }

  // Otherwise, show table grid + panel of completed orders
  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-6 bg-white overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Dine-In Tables</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTables.map(tbl => (
            <motion.div
              key={tbl.id}
              onClick={() => handleTableClick(tbl)}
              whileTap={{ scale: 0.95 }}
              className="
                cursor-pointer rounded-2xl p-6 flex flex-col justify-center items-center 
                shadow-md transition-shadow duration-200 bg-white hover:shadow-lg aspect-square
              "
            >
              <Table size={40} className="text-[#1D150B]" />
              <h3 className="mt-4 text-2xl font-semibold text-[#1D150B]">
                Table {tbl.tableNumber}
              </h3>
            </motion.div>
          ))}
        </div>
      </main>

      <TablePanel
        tables={completedOrders}
        onRemoveTable={handleRemoveTable}
      />
    </div>
  );
}
