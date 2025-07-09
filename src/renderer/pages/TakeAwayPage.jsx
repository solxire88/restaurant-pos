// src/pages/TakeAwayPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  List,
  Utensils,
  Leaf,
  Pizza,
  Sandwich,
  Soup,
  Drumstick,
  Users,
  CupSoda,
  Droplet,
  Coffee,
  Snowflake,
  Beaker,
  Donut,
  IceCream
} from 'lucide-react';import { motion } from 'framer-motion';
import Sidebar from '../components/SideBar';
import OrderPanel from '../components/OrderPanel';
import OrderSummaryModal from '../components/OrderSummaryModal';
import logo from '../assets/logo.png';

const categories = [
  { name: 'All',                icon: List       },
  { name: 'Entrée',             icon: Utensils   },
  { name: 'Salades',            icon: Leaf       },
  { name: 'Gratins',            icon: Soup       },
  { name: 'Baguettes Farcies',  icon: Sandwich  },
  { name: 'Calzones',           icon: Pizza      },
  { name: 'Sandwiches',         icon: Sandwich   },
  { name: 'Tacos',              icon: Sandwich   },
  { name: 'Burgers',            icon: Sandwich  },
  { name: 'Fajitas',            icon: Soup       },
  { name: 'Chapati',            icon: Sandwich   },
  { name: 'Box',                icon: Users      },
  { name: 'Wings',              icon: Drumstick  },
  { name: 'Snacks',             icon: Sandwich  },  
  { name: 'Plats',              icon: Utensils   },
  { name: 'Plat Familial',      icon: Users      },
  { name: 'Pizza (Tomate)',     icon: Pizza      },
  { name: 'Pizza (Blanche)',    icon: Pizza      },
  { name: 'Boissons',           icon: CupSoda    },
  { name: 'Jus Naturels',       icon: Droplet    },
  { name: 'Milkshakes',         icon: IceCream   },
  { name: 'Boissons Chaudes',   icon: Coffee     },
  { name: 'Boissons Froides',   icon: Snowflake  },
  { name: 'Bubbles',            icon: Soup       },
  { name: 'Crêpes',             icon: Donut      },
  { name: 'Pancakes',           icon: Donut      },
  { name: 'Desserts',           icon: IceCream   },
  { name: 'Glaces',             icon: IceCream   },

];

export default function TakeAwayPage() {
  const [menuItems, setMenuItems]     = useState([]);
  const [orderItems, setOrderItems]   = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedCategory, setCategory] = useState('All');
  const [showModal, setShowModal]     = useState(false);

  // 1) Load menu from backend on mount
  useEffect(() => {
    window.api.fetchMenu()
      .then(setMenuItems)
      .catch(console.error);
  }, []);

  // Add / remove items
  const handleAddItem = item => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const handleRemoveItem = idx =>
    setOrderItems(prev => prev.filter((_, i) => i !== idx));

  // Place / cancel
  const handlePlaceOrder = () => setShowModal(true);
  const handleCancel     = () => setOrderItems([]);

  // Finalize payment
  const handleFinishPayment = async () => {
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Increment daily total by the sale amount
    await window.api.incrementDailyTotal(total);
    // Increment order count
    await window.api.incrementOrderCount();
    setOrderItems([]);
    setShowModal(false);
  };

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const byCat    = selectedCategory === 'All' || item.category === selectedCategory;
      const bySearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return byCat && bySearch;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // print handlers
  const printCustomer = () => {
    window.api.printReceipt({ items: orderItems, receiver: 'customer' })
      .then(response => {
        if (!response.success) console.error(response.message);
      });
  };
  const printChef = () => {
    window.api.printReceipt({ items: orderItems, receiver: 'chef' })
      .then(response => {
        if (!response.success) console.error(response.message);
      });
  };

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 p-6 bg-white overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Commandes à emporter</h1>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex space-x-2 mb-6 overflow-x-auto flex-wrap gap-2 overflow-y-hidden"> 
            {categories.map(({ name, icon: Icon }) => (
              <motion.button
                key={name}
                onClick={() => setCategory(name)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 h-12 rounded-full font-medium transition-all transform whitespace-nowrap
                  ${selectedCategory === name
                    ? 'bg-[#4E71FF] text-white scale-105'
                    : 'bg-gray-200 text-[#1D150B] hover:bg-[#ffe6d8] hover:scale-105'
                  }
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {name}
              </motion.button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map(item => (
              <motion.div
                key={item.id}
                onClick={() => handleAddItem(item)}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-[#1D150B] mb-2">
                    {item.name}
                  </h3>
                  {/* <p className="text-base text-gray-500 mb-4 flex-1">
                    {item.description}
                  </p> */}
                </div>
                <span className="text-xl font-bold text-[#4E71FF]">
                  {item.price} D.A
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <OrderPanel
          items={orderItems}
          onPlaceOrder={handlePlaceOrder}
          onCancel={handleCancel}
          onRemoveItem={handleRemoveItem}
        />
      </div>

      {showModal && (
        <OrderSummaryModal
          items={orderItems}
          onClose={() => setShowModal(false)}
          onFinishPayment={handleFinishPayment}
          onPrintCustomer={printCustomer}
          onPrintChef={printChef}
        />
      )}
    </>
  );
}
