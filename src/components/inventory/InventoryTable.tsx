import React from 'react';
import { motion } from 'framer-motion';
import type { InventoryItem } from '../../types/inventory';
import { MoreHorizontal, Truck } from 'lucide-react';
import { getUnitProfit } from '../../data/mockInventory';

interface InventoryTableProps {
    data: InventoryItem[];
    // stats: InventoryStats; // Unused

    onRowClick?: (item: InventoryItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ data, onRowClick }) => {

    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    // Reset page when data changes (e.g. filtering)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const formatCurrency = (amount: number, currency = 'EGP') => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            {/* Header is sticky within the container */}
            <div className="overflow-x-auto flex-1 h-[680px]"> {/* Fixed height container for scrolling */}
                <table className="inventory-table w-full text-left border-collapse relative">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <tr>
                            <th className="font-bold uppercase tracking-wider text-slate-500 w-[280px]">Product / SKU</th>
                            <th className="font-bold uppercase tracking-wider text-slate-500 text-center w-[140px]">Stock Status</th>
                            <th className="font-bold uppercase tracking-wider text-slate-500 text-center w-[200px]">Inventory Flow</th>
                            <th className="font-bold uppercase tracking-wider text-slate-500 text-right w-[160px]">Unit Financials</th>
                            <th className="font-bold uppercase tracking-wider text-slate-500 text-right w-[120px]">Net Profit</th>
                            <th className="font-bold uppercase tracking-wider text-slate-500 text-center w-[120px]">Shipping</th>
                            <th className="font-bold uppercase tracking-wider text-slate-500 w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentData.length > 0 ? (
                            currentData.map((item, index) => {
                                const unitProfit = getUnitProfit(item);
                                const profitMargin = (unitProfit / item.financials.price) * 100;
                                const isLowStock = item.stock.available < 10 && item.stock.available > 0;
                                const isOutOfStock = item.stock.available === 0;

                                // Calculate flow percentages
                                const totalTracked = item.status.warehouse + item.status.shipped + item.status.delivered + item.status.returned;
                                // Avoid division by zero if totalTracked is 0 (unlikely but safe)
                                const safeTotal = totalTracked || 1;

                                return (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => onRowClick && onRowClick(item)}
                                        className={`group hover:bg-slate-50 transition-colors cursor-pointer text-sm h-[80px] border-b border-slate-50 last:border-0
                                            ${isLowStock ? 'bg-amber-50/30' : ''}
                                            ${isOutOfStock ? 'bg-rose-50/20' : ''}
                                        `}
                                    >
                                        {/* Product */}
                                        <td className="align-middle">
                                            <div className="product-cell">
                                                <div className="w-10 h-10 rounded-lg border border-slate-200 p-1 bg-white shrink-0 overflow-hidden flex items-center justify-center">
                                                    <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                    <div className="meta flex items-center gap-2">
                                                        <span className="text-xs text-slate-500 font-mono">{item.sku}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Stock Status */}
                                        <td className="align-middle text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border
                                                    ${isOutOfStock ? 'bg-rose-100 text-rose-700 border-rose-200' :
                                                        isLowStock ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-medium mt-1">
                                                    {item.stock.available} Available
                                                </span>
                                            </div>
                                        </td>

                                        {/* Inventory Flow */}
                                        <td className="align-middle">
                                            <div className="w-full max-w-[180px] mx-auto flex flex-col gap-1.5">
                                                <div className="inventory-flow inventory-flow-bar flex w-full bg-slate-100 overflow-hidden">
                                                    <div style={{ width: `${(item.status.warehouse / safeTotal) * 100}%` }} className="bg-blue-500" title={`Warehouse: ${item.status.warehouse}`} />
                                                    <div style={{ width: `${(item.status.shipped / safeTotal) * 100}%` }} className="bg-orange-400" title={`Shipped: ${item.status.shipped}`} />
                                                    <div style={{ width: `${(item.status.delivered / safeTotal) * 100}%` }} className="bg-emerald-500" title={`Delivered: ${item.status.delivered}`} />
                                                    {item.status.returned > 0 && (
                                                        <div style={{ width: `${(item.status.returned / safeTotal) * 100}%` }} className="bg-rose-500" title={`Returned: ${item.status.returned}`} />
                                                    )}
                                                </div>
                                                <div className="flex justify-between text-[10px] items-center px-1">
                                                    <span className="text-slate-500 font-medium">WH: {item.status.warehouse}</span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className="text-slate-500 font-medium">Del: {item.status.delivered}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Unit Financials */}
                                        <td className="text-right align-middle">
                                            <div className="flex flex-col items-end">
                                                <span className="text-slate-900 font-bold text-[13px]">{formatCurrency(item.financials.price)}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] text-slate-500">Cost: {formatCurrency(item.financials.cost)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className={`text-[11px] font-bold ${profitMargin > 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {profitMargin.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Net Profit */}
                                        <td className="text-right align-middle">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-mono font-bold text-[13px] ${item.status.delivered > 0 ? 'text-emerald-700' : 'text-slate-400'
                                                    }`}>
                                                    {formatCurrency(unitProfit * item.status.delivered)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">Realized</span>
                                            </div>
                                        </td>

                                        {/* Shipping Provider */}
                                        <td className="align-middle text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
                                                <Truck size={10} />
                                                {item.shipping_company}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="text-center align-middle">
                                            <div className="flex justify-end pr-2">
                                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-20">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <p className="text-sm">No items found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer with timestamp and pagination */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Last updated just now
                    </p>
                    <div className="h-3 w-px bg-slate-300" />
                    <p className="text-[11px] font-medium text-slate-500">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} of {data.length} items
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-2 text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-sm">
                        {currentPage} / {totalPages || 1}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
