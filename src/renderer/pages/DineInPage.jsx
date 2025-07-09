import React, { useState } from 'react';
import { Table } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/SideBar';
import TablePanel from '../components/TablePanel';
import TableOrderPage from './TableOrderPage';

// mock table list
const allTables = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  tableNumber: i + 1,
}));

export default function DineInPage() {
  const [currentTable, setCurrentTable] = useState(null);

  const handleTableClick = (tbl) => {
    setCurrentTable(tbl);
  };

  const handleCancelOrder = () => {
    setCurrentTable(null);
  };

  // Use closure to access currentTable; expect onComplete called with { items, total }
  const handleCompleteOrder = async ({ items, total }) => {
    if (!currentTable) return console.error('No table!');
    const tableNumber = currentTable.tableNumber;

    // the actual save already happened in TableOrderPage,
    // but if you need additional steps, do them here.

    // Go back to the grid/panel
    setCurrentTable(null);

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

  // Otherwise, show table grid + panel of active orders
  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-6 bg-white overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Commandes Sur Place</h1>
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <TablePanel />
    </div>
  );
}
