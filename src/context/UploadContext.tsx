import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UploadContextType {
    isOpen: boolean;
    openUpload: () => void;
    closeUpload: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openUpload = () => setIsOpen(true);
    const closeUpload = () => setIsOpen(false);

    return (
        <UploadContext.Provider value={{ isOpen, openUpload, closeUpload }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};
