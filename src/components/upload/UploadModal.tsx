import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, AlertCircle, ArrowRight, Loader2, Database, ShoppingCart, Users, Megaphone, TrendingUp } from 'lucide-react';
import { parseCSV } from '../../utils/fileHelpers';
import { useUpload } from '../../context/UploadContext';
import { useAuth } from '../../context/AuthContext';

type Step = 'type' | 'upload' | 'mapping' | 'preview' | 'processing' | 'success';
type DataType = 'orders' | 'inventory' | 'customers' | 'ads' | 'insights' | null;

const DATA_TYPES = [
    { id: 'orders', label: 'Orders', icon: ShoppingCart, desc: 'Sales data, order IDs, and revenue stats' },
    { id: 'inventory', label: 'Inventory', icon: Database, desc: 'Product lists, stock levels, and costs' },
    { id: 'customers', label: 'Customers', icon: Users, desc: 'Customer profiles and purchase history' },
    { id: 'ads', label: 'Ads', icon: Megaphone, desc: 'Campaign metrics from Meta, Google, etc.' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, desc: 'Expenses, budget tracking, and forecasts' },
];

const REQUIRED_FIELDS: Record<string, string[]> = {
    orders: ['Order ID', 'Total', 'Status', 'Date'],
    inventory: ['Product Name', 'SKU', 'Quantity', 'Cost'],
    customers: ['Name', 'Email'],
    ads: ['Campaign Name', 'Spend', 'Revenue'],
    insights: ['Date', 'Description', 'Amount'],
};

export const UploadModal: React.FC = () => {
    const { isOpen, closeUpload } = useUpload();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('type');
    const [dataType, setDataType] = useState<DataType>(null);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('type');
            setDataType(null);
            setFile(null);
            setParsedData([]);
            setHeaders([]);
            setMapping({});
            setUploadError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
                setUploadError('File size exceeds 10MB limit.');
                return;
            }
            setFile(selectedFile);
            setUploadError(null);

            try {
                // Parse file
                const data = await parseCSV(selectedFile);
                setParsedData(data);
                if (data.length > 0) {
                    const fileHeaders = Object.keys(data[0]);
                    setHeaders(fileHeaders);
                    // Auto-map logic
                    const newMapping: Record<string, string> = {};
                    if (dataType && REQUIRED_FIELDS[dataType]) {
                        REQUIRED_FIELDS[dataType].forEach(reqField => {
                            const match = fileHeaders.find(h => h.toLowerCase() === reqField.toLowerCase());
                            if (match) newMapping[reqField] = match;
                        });
                    }
                    setMapping(newMapping);
                    setStep('mapping');
                } else {
                    setUploadError('File appears to be empty.');
                }
            } catch (err) {
                setUploadError('Failed to parse file. Please check format.');
            }
        }
    };

    const handleUpload = async () => {
        setStep('processing');

        try {
            // Simulate upload delay
            const payload = {
                user_id: user?.id,
                data_type: dataType,
                file_name: file?.name,
                mapped_data_sample: parsedData.slice(0, 5),
                mapping: mapping,
                uploaded_at: new Date().toISOString()
            };

            console.log('🚀 Uploading payload:', payload);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStep('success');
        } catch (error) {
            console.error('Upload failed', error);
            setStep('type');
        }
    };

    const isMappingValid = () => {
        if (!dataType) return false;
        return REQUIRED_FIELDS[dataType].every(field => mapping[field]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeUpload}
                        className="absolute inset-0 bg-[#0f172a]/45 backdrop-blur-[4px]"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-white w-full flex flex-col overflow-hidden"
                        style={{
                            width: '720px',
                            maxWidth: '90vw',
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '24px 24px 20px',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15), 0 4px 10px rgba(15, 23, 42, 0.08)',
                            maxHeight: '90vh'
                        }}
                    >
                        {/* Header Section */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    margin: 0
                                }}>
                                    Import Data
                                </h2>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#64748b',
                                    marginTop: '4px',
                                    margin: 0
                                }}>
                                    {step === 'type' && 'What kind of data are you uploading?'}
                                    {step === 'upload' && 'Upload your spreadsheet'}
                                    {step === 'mapping' && 'Map your columns'}
                                    {step === 'preview' && 'Review data before import'}
                                    {step === 'processing' && 'Processing...'}
                                    {step === 'success' && 'Import Successful'}
                                </p>
                            </div>
                            <button
                                onClick={closeUpload}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8'
                                }}
                                className="hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto" style={{ padding: '28px', background: '#f8fafc' }}>
                            {/* Step 1: Data Type Selection */}
                            {step === 'type' && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '16px',
                                    marginTop: '16px'
                                }}>
                                    {DATA_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = dataType === type.id;
                                        return (
                                            <div
                                                key={type.id}
                                                onClick={() => setDataType(type.id as DataType)}
                                                className={`
                                                    transition-all duration-200
                                                    ${isSelected
                                                        ? 'border-[#0ea5e9] bg-[#f0f9ff]'
                                                        : 'border-[#e2e8f0] bg-white hover:border-[#38bdf8] hover:shadow-[0_8px_20px_rgba(56,189,248,0.15)]'
                                                    }
                                                `}
                                                style={{
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div className={`
                                                    mb-4 transition-colors
                                                    ${isSelected ? 'text-[#0ea5e9]' : 'text-[#64748b]'}
                                                `}>
                                                    <Icon size={24} strokeWidth={1.5} />
                                                </div>
                                                <h3 className="text-[#0f172a] font-semibold text-[15px] mb-[4px]">
                                                    {type.label}
                                                </h3>
                                                <p className="text-[#64748b] text-[13px] leading-[1.4]">
                                                    {type.desc}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 2: Upload */}
                            {step === 'upload' && (
                                <div className="max-w-xl mx-auto py-8">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-white hover:border-[#2563eb] transition-all cursor-pointer group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <Upload size={28} className="text-[#2563eb]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#0f172a] mb-2">Upload your file</h3>
                                        <p className="text-[#64748b] font-medium mb-8">Drag & drop or click to browse</p>
                                        <button className="px-6 py-2 bg-[#2563eb] text-white rounded-[10px] text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10">
                                            Select File
                                        </button>
                                    </div>
                                    {uploadError && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                            <AlertCircle size={16} />
                                            {uploadError}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Mapping */}
                            {step === 'mapping' && dataType && (
                                <div className="space-y-6 pb-6">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
                                        <AlertCircle size={20} className="text-[#2563eb] mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-[#1e3a8a]">Review Column Mapping</p>
                                            <p className="text-sm text-[#1e40af] mt-1">Ensure your file columns match the required system fields.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 border-b border-[#e5e7eb]">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold text-[#0f172a]">System Field</th>
                                                    <th className="px-6 py-3 font-semibold text-[#0f172a]">Your Column</th>
                                                    <th className="px-6 py-3 font-semibold text-[#0f172a] w-24">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e5e7eb]">
                                                {REQUIRED_FIELDS[dataType].map(field => {
                                                    const isMapped = !!mapping[field];
                                                    return (
                                                        <tr key={field} className={isMapped ? 'bg-white' : 'bg-red-50/10'}>
                                                            <td className="px-6 py-3">
                                                                <span className="font-medium text-[#0f172a]">{field}</span>
                                                                <span className="text-red-500 ml-1">*</span>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <select
                                                                    value={mapping[field] || ''}
                                                                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                                                                    className={`
                                                                        w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all
                                                                        ${isMapped
                                                                            ? 'border-[#e5e7eb] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
                                                                            : 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                                        }
                                                                    `}
                                                                >
                                                                    <option value="">Select column...</option>
                                                                    {headers.map(h => (
                                                                        <option key={h} value={h}>{h}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-3 text-center">
                                                                {isMapped ? (
                                                                    <Check size={18} className="text-[#2563eb] mx-auto" />
                                                                ) : (
                                                                    <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto" />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Preview */}
                            {step === 'preview' && (
                                <div className="space-y-6 pb-6">
                                    <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left whitespace-nowrap">
                                                <thead className="bg-slate-50 border-b border-[#e5e7eb]">
                                                    <tr>
                                                        {Object.keys(mapping).map(key => (
                                                            <th key={key} className="px-6 py-3 font-semibold text-[#0f172a]">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#e5e7eb]">
                                                    {parsedData.slice(0, 5).map((row, i) => (
                                                        <tr key={i} className="hover:bg-slate-50">
                                                            {Object.keys(mapping).map(key => (
                                                                <td key={key} className="px-6 py-3 text-[#64748b]">
                                                                    {row[mapping[key]]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Processing */}
                            {step === 'processing' && (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <Loader2 size={48} className="text-[#2563eb] animate-spin mb-6" />
                                    <h3 className="text-lg font-semibold text-[#0f172a]">Processing...</h3>
                                </div>
                            )}

                            {/* Success */}
                            {step === 'success' && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="w-16 h-16 bg-[#eff6ff] rounded-full flex items-center justify-center mb-6">
                                        <Check size={32} className="text-[#2563eb]" strokeWidth={3} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#0f172a] mb-2">Import Successful</h3>
                                    <p className="text-[#64748b] text-center mb-8">Your data has been added to the queue.</p>
                                    <button
                                        onClick={closeUpload}
                                        className="bg-[#2563eb] text-white px-8 py-2.5 rounded-[10px] font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer (Padding updated) */}
                        {step !== 'processing' && step !== 'success' && (
                            <div className="px-[32px] pb-[32px] pt-[28px] border-t border-[#e5e7eb] mt-auto flex justify-between items-center bg-white rounded-b-[16px]">
                                <button
                                    onClick={step === 'type' ? closeUpload : () => {
                                        if (step === 'upload') setStep('type');
                                        if (step === 'mapping') setStep('upload');
                                        if (step === 'preview') setStep('mapping');
                                    }}
                                    className="text-[#64748b] text-[14px] font-medium hover:text-[#0f172a] transition-colors"
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    {step === 'type' ? 'Cancel' : 'Back'}
                                </button>

                                <button
                                    disabled={
                                        (step === 'type' && !dataType) ||
                                        (step === 'upload' && !file) ||
                                        (step === 'mapping' && !isMappingValid())
                                    }
                                    onClick={() => {
                                        if (step === 'type') setStep('upload');
                                        if (step === 'upload') {
                                            if (file && !uploadError) setStep('mapping');
                                        }
                                        if (step === 'mapping') setStep('preview');
                                        if (step === 'preview') handleUpload();
                                    }}
                                    className="px-[20px] py-[10px] rounded-[10px] text-white font-medium transition-colors flex items-center gap-2"
                                    style={{
                                        background: (step === 'type' && !dataType) || (step === 'upload' && !file) || (step === 'mapping' && !isMappingValid()) ? '#cbd5e1' : '#2563eb',
                                        cursor: (step === 'type' && !dataType) || (step === 'upload' && !file) || (step === 'mapping' && !isMappingValid()) ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {step === 'preview' ? 'Confirm Import' : 'Continue'}
                                    {step !== 'preview' && <ArrowRight size={16} />}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
