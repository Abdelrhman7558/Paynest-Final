import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Database } from 'lucide-react';
import { UploadService } from '../../services/uploadService';
import * as XLSX from 'xlsx';

interface UploadSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: (fileUrl: string) => void;
}

type UploadStep = 'type-selection' | 'source-selection' | 'upload' | 'mapping' | 'processing' | 'success' | 'error';
type DataType = 'orders' | 'inventory' | 'expenses' | 'customers';

// --- Data Schemas ---
const SCHEMAS: Record<DataType, { key: string; label: string; required: boolean }[]> = {
    orders: [
        { key: 'order_number', label: 'Order Number', required: true },
        { key: 'customer_name', label: 'Customer Name', required: true },
        { key: 'total_amount', label: 'Total Amount', required: true },
        { key: 'status', label: 'Status', required: false },
        { key: 'created_at', label: 'Date', required: false },
        { key: 'customer_email', label: 'Email', required: false },
    ],
    inventory: [
        { key: 'sku', label: 'SKU', required: true },
        { key: 'name', label: 'Product Name', required: true },
        { key: 'stock', label: 'Stock Level', required: true },
        { key: 'price', label: 'Price', required: false },
        { key: 'cost', label: 'Cost', required: false },
    ],
    expenses: [
        { key: 'costName', label: 'Expense Name', required: true },
        { key: 'amount', label: 'Amount', required: true },
        { key: 'category', label: 'Category', required: false },
        { key: 'date', label: 'Date', required: false },
    ],
    customers: [
        { key: 'name', label: 'Name', required: true },
        { key: 'email', label: 'Email', required: false },
        { key: 'phone', label: 'Phone', required: false },
        { key: 'city', label: 'City', required: false },
        { key: 'total_spent', label: 'Total Spent', required: false },
    ]
};

const DATA_TYPES: { id: DataType; label: string; icon: any }[] = [
    { id: 'orders', label: 'Orders', icon: FileSpreadsheet },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'expenses', label: 'Expenses', icon: FileSpreadsheet },
    { id: 'customers', label: 'Customers', icon: FileSpreadsheet },
];

export const UploadSheetModal: React.FC<UploadSheetModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
    const { theme, mode } = useTheme();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Flow State
    const [step, setStep] = useState<UploadStep>('type-selection');
    const [dataType, setDataType] = useState<DataType | ''>('');
    const [sourceType, setSourceType] = useState<'file' | 'gsheet'>('file');

    // Data State

    const [gsheetUrl, setGsheetUrl] = useState('');
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [parsedData, setParsedData] = useState<any[]>([]); // Raw data from file/sheet
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({}); // systemKey -> userHeader

    // UI State
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setStep('type-selection');
            setDataType('');
            setGsheetUrl('');
            setFileHeaders([]);
            setParsedData([]);
            setColumnMapping({});
            setError(null);
            setUploadProgress(0);
        }
    }, [isOpen]);

    // --- Helpers ---

    const handleFileProcess = useCallback(async (file: File) => {
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (json.length === 0) throw new Error("File is empty");

            const headers = (json[0] as string[]).map(h => String(h).trim()).filter(h => h);
            const rows = json.slice(1); // Keep raw data for later

            setFileHeaders(headers);
            setParsedData(rows);
            setStep('mapping');

            // Auto-map simple matches
            const newMapping: Record<string, string> = {};
            if (dataType) {
                const schema = SCHEMAS[dataType as DataType];
                schema.forEach(field => {
                    // Try exact match or similar
                    const match = headers.find(h =>
                        h.toLowerCase() === field.key.toLowerCase() ||
                        h.toLowerCase() === field.label.toLowerCase() ||
                        h.toLowerCase().includes(field.label.toLowerCase())
                    );
                    if (match) newMapping[field.key] = match;
                });
                setColumnMapping(newMapping);
            }
        } catch (err) {
            setError("Failed to parse file. Please upload a valid Excel or CSV.");
            setStep('error');
        }
    }, [dataType]);

    const handleGSheetFetch = useCallback(async () => {
        if (!gsheetUrl.includes('google.com/spreadsheets')) {
            setError("Please enter a valid Google Sheets URL");
            return;
        }

        try {
            setStep('processing'); // Show loading state briefly

            // Convert to export URL
            // Extract ID: /d/123456.../
            const match = gsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) throw new Error("Invalid Sheet URL");
            const sheetId = match[1];
            const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

            const response = await fetch(exportUrl);
            if (!response.ok) throw new Error("Could not access sheet. Make sure it is 'Public' or 'Published to Web'.");

            const blob = await response.blob();
            const file = new File([blob], "imported_sheet.csv", { type: "text/csv" });
            await handleFileProcess(file); // Reuse file processing logic
            setStep('mapping'); // Ensure we move to mapping step on success
        } catch (err: any) {
            setStep('error'); // Go to error step
            setError(err.message || "Could not fetch Google Sheet. Ensure it is visible to 'Anyone with the link'.");
        }
    }, [gsheetUrl, handleFileProcess]);

    const handleUploadFinal = useCallback(async () => {
        if (!dataType || !user?.id) return;

        setStep('processing');
        setUploadProgress(10);

        try {
            // 1. Reconstruct Data with Mapped Columns
            const standardizedData = parsedData.map((row: any) => {
                const newRow: any = {};

                Object.entries(columnMapping).forEach(([schemaKey, userHeader]) => {
                    const headerIndex = fileHeaders.indexOf(userHeader);
                    if (headerIndex !== -1) {
                        // Safely access row index
                        newRow[schemaKey] = row[headerIndex];
                    }
                });
                return newRow;
            });

            // 2. Convert back to Sheet/CSV
            const newWs = XLSX.utils.json_to_sheet(standardizedData);
            const newWb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWb, newWs, "CleanData");
            const csvOutput = XLSX.write(newWb, { bookType: 'csv', type: 'array' });

            // 3. Create a clean file object
            const finalFile = new File([csvOutput], `clean_${dataType}_${Date.now()}.csv`, { type: 'text/csv' });

            // 4. Upload
            const result = await UploadService.uploadFile(finalFile, user.id, dataType);

            if (result.success) {
                setUploadProgress(100);
                setStep('success');
                if (onUploadComplete) onUploadComplete(result.fileUrl!);
            } else {
                setError(result.error || "Upload failed");
                setStep('error');
            }

        } catch (err: any) {
            setError(err.message || 'Processing failed');
            setStep('error');
        }
    }, [dataType, user?.id, parsedData, columnMapping, fileHeaders, onUploadComplete]);


    // --- Render Steps ---

    const renderTypeSelection = () => (
        <div style={{ paddingTop: 10 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary, marginBottom: 16 }}>
                What are you uploading?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {DATA_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => { setDataType(type.id); setStep('source-selection'); }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                            padding: 24, borderRadius: 12,
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.app,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.primary;
                            e.currentTarget.style.backgroundColor = mode === 'Dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.border.primary;
                            e.currentTarget.style.backgroundColor = theme.bg.app;
                        }}
                    >
                        <type.icon size={32} color={theme.accent.primary} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: theme.text.primary }}>{type.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSourceSelection = () => (
        <div>
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => setStep('type-selection')} style={{ background: 'none', border: 'none', color: theme.text.secondary, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={14} /> Back
                </button>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary, marginBottom: 8 }}>
                Choose source
            </h3>
            <p style={{ fontSize: 13, color: theme.text.secondary, marginBottom: 24 }}>
                Upload an Excel file or connect a Google Sheet.
            </p>

            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <button
                    onClick={() => setSourceType('file')}
                    style={{
                        flex: 1, padding: 12, borderRadius: 8,
                        border: `1px solid ${sourceType === 'file' ? theme.accent.primary : theme.border.primary}`,
                        backgroundColor: sourceType === 'file' ? (mode === 'Dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF') : 'transparent',
                        color: sourceType === 'file' ? theme.accent.primary : theme.text.secondary,
                        fontWeight: 500, cursor: 'pointer'
                    }}
                >
                    File Upload
                </button>
                <button
                    onClick={() => setSourceType('gsheet')}
                    style={{
                        flex: 1, padding: 12, borderRadius: 8,
                        border: `1px solid ${sourceType === 'gsheet' ? theme.accent.primary : theme.border.primary}`,
                        backgroundColor: sourceType === 'gsheet' ? (mode === 'Dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF') : 'transparent',
                        color: sourceType === 'gsheet' ? theme.accent.primary : theme.text.secondary,
                        fontWeight: 500, cursor: 'pointer'
                    }}
                >
                    Google Sheet
                </button>
            </div>

            {sourceType === 'file' ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) {
                            handleFileProcess(file);
                        }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        padding: 48,
                        borderRadius: 12,
                        border: `2px dashed ${dragOver ? theme.accent.primary : theme.border.primary}`,
                        backgroundColor: dragOver ? (mode === 'Dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF') : theme.bg.app,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleFileProcess(file);
                            }
                        }}
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                    />
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: theme.bg.hover, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Upload size={24} color={theme.text.primary} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: theme.text.primary, marginBottom: 4 }}>
                        Click to upload or drag and drop
                    </p>
                    <p style={{ fontSize: 12, color: theme.text.secondary }}>
                        Excel or CSV files only
                    </p>
                </div>
            ) : (
                <div style={{ padding: 24, borderRadius: 12, backgroundColor: theme.bg.app, border: `1px solid ${theme.border.primary}` }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>
                                Google Sheet URL
                            </label>
                            <input
                                type="text"
                                value={gsheetUrl}
                                onChange={(e) => setGsheetUrl(e.target.value)}
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                style={{
                                    width: '100%', padding: '10px 12px', borderRadius: 8,
                                    border: `1px solid ${theme.border.primary}`,
                                    backgroundColor: theme.bg.card, color: theme.text.primary,
                                    outline: 'none', fontSize: 14
                                }}
                            />
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: theme.text.secondary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={12} />
                        Must be "Anyone with the link can view".
                    </p>
                    <button
                        onClick={handleGSheetFetch}
                        disabled={!gsheetUrl}
                        style={{
                            width: '100%', padding: '10px', borderRadius: 8,
                            backgroundColor: theme.accent.primary, color: 'white',
                            border: 'none', fontWeight: 500, cursor: gsheetUrl ? 'pointer' : 'not-allowed',
                            opacity: gsheetUrl ? 1 : 0.5
                        }}
                    >
                        Connect Sheet
                    </button>
                </div>
            )}
        </div>
    );

    const renderMapping = () => {
        const schema = dataType ? SCHEMAS[dataType as DataType] : [];
        const isReady = schema.every(f => !f.required || columnMapping[f.key]);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary }}>Map Columns</h3>
                    <p style={{ fontSize: 13, color: theme.text.secondary }}>Match your file columns to the system fields.</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, marginBottom: 20 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', paddingBottom: 12, fontSize: 12, color: theme.text.secondary }}>System Field</th>
                                <th style={{ textAlign: 'left', paddingBottom: 12, fontSize: 12, color: theme.text.secondary }}>Your File Column</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schema.map((field) => (
                                <tr key={field.key} style={{ borderBottom: `1px solid ${theme.border.primary}` }}>
                                    <td style={{ padding: '12px 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 14, fontWeight: 500, color: theme.text.primary }}>{field.label}</span>
                                            {field.required && <span style={{ fontSize: 10, color: '#EF4444', backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>Required</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 0 12px 16px' }}>
                                        <select
                                            value={columnMapping[field.key] || ''}
                                            onChange={(e) => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}
                                            style={{
                                                width: '100%', padding: '8px 12px', borderRadius: 6,
                                                border: `1px solid ${columnMapping[field.key] ? theme.accent.primary : theme.border.primary}`,
                                                backgroundColor: theme.bg.card, color: theme.text.primary,
                                                fontSize: 13, outline: 'none'
                                            }}
                                        >
                                            <option value="">Select Column...</option>
                                            {fileHeaders.map((h, i) => (
                                                <option key={i} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                    <button
                        onClick={() => { setStep('source-selection'); setFileHeaders([]); setColumnMapping({}); }}
                        style={{
                            padding: '12px 24px', borderRadius: 8,
                            border: `1px solid ${theme.border.primary}`, backgroundColor: 'transparent',
                            color: theme.text.primary, cursor: 'pointer', fontWeight: 500
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleUploadFinal}
                        disabled={!isReady}
                        style={{
                            flex: 1, padding: '12px 24px', borderRadius: 8,
                            backgroundColor: theme.accent.primary, color: 'white',
                            border: 'none', cursor: isReady ? 'pointer' : 'not-allowed',
                            opacity: isReady ? 1 : 0.5, fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        Start Import <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderProcessing = () => (
        <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{
                width: 64, height: 64, margin: '0 auto 24px',
                borderRadius: '50%', border: `4px solid ${theme.border.primary}`,
                borderTopColor: theme.accent.primary, animation: 'spin 1s linear infinite'
            }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary, marginBottom: 8 }}>
                Processing Data...
            </h3>
            <p style={{ fontSize: 14, color: theme.text.secondary }}>
                {uploadProgress < 50 ? 'Reading and validating file...' : 'Uploading to database...'}
            </p>
        </div>
    );

    const renderSuccess = () => (
        <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{
                width: 64, height: 64, margin: '0 auto 24px',
                borderRadius: '50%', backgroundColor: '#D1FAE5',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <CheckCircle size={32} color="#065F46" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary, marginBottom: 8 }}>
                Import Successful!
            </h3>
            <p style={{ fontSize: 14, color: theme.text.secondary, marginBottom: 24 }}>
                Your data has been successfully imported and mapped.
            </p>
            <button
                onClick={onClose}
                style={{
                    padding: '12px 32px', borderRadius: 8,
                    backgroundColor: theme.accent.primary, color: 'white',
                    border: 'none', cursor: 'pointer', fontWeight: 600
                }}
            >
                Done
            </button>
        </div>
    );

    // AnimatePresence Layout
    const getStepContent = () => {
        switch (step) {
            case 'type-selection': return renderTypeSelection();
            case 'source-selection': return renderSourceSelection();
            case 'mapping': return renderMapping();
            case 'processing': return renderProcessing();
            case 'success': return renderSuccess();
            case 'error': return (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ marginBottom: 16, color: '#EF4444' }}>
                        <AlertCircle size={48} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary, marginBottom: 8 }}>
                        Import Failed
                    </h3>
                    <p style={{ fontSize: 14, color: theme.text.secondary, marginBottom: 24 }}>{error || 'An unexpected error occurred.'}</p>
                    <button onClick={() => {
                        setStep('source-selection');
                        setError(null);
                        setFileHeaders([]);
                        setParsedData([]);
                        setColumnMapping({});
                        setGsheetUrl('');
                    }} style={{ padding: '10px 20px', backgroundColor: theme.accent.primary, color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Try Again</button>
                </div>
            );
            default: return null;
        }
    };


    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    width: '100%', maxWidth: 600, height: step === 'mapping' ? '80vh' : 'auto', maxHeight: '90vh',
                    backgroundColor: theme.bg.card,
                    borderRadius: 16, border: `1px solid ${theme.border.primary}`,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    display: 'flex', flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border.primary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                        {step === 'mapping' ? `Map ${DATA_TYPES.find(d => d.id === dataType)?.label} Columns` : 'Import Data'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: theme.text.secondary }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {getStepContent()}
                </div>
            </motion.div>
        </div>
    );
};
