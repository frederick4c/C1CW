"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppState {
    datasetUploaded: boolean;
    modelTrained: boolean;
    datasetInfo: { X: number[], y: number[] } | null;
    loading: boolean;
    refreshStatus: () => Promise<void>;
    setDatasetUploaded: (uploaded: boolean) => void;
    clearAll: () => Promise<void>;
    deleteModel: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [datasetUploaded, setDatasetUploaded] = useState(false);
    const [modelTrained, setModelTrained] = useState(false);
    const [datasetInfo, setDatasetInfo] = useState<{ X: number[], y: number[] } | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshStatus = async () => {
        const API_URL = 'http://localhost:8000';

        try {
            // Check if model is loaded (indicates training has happened)
            const statusRes = await fetch(`${API_URL}/status`);
            const statusData = await statusRes.json();
            setModelTrained(statusData.model_loaded || false);
            setDatasetUploaded(statusData.data_loaded || false);

        } catch (error) {
            console.error('Error fetching app status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetDatasetUploaded = (uploaded: boolean) => {
        setDatasetUploaded(uploaded);
    };

    const clearAll = async () => {
        try {
            await fetch('http://localhost:8000/reset', { method: 'DELETE' });
            setDatasetUploaded(false);
            setModelTrained(false);
            setDatasetInfo(null);
            localStorage.removeItem('datasetUploaded');
        } catch (error) {
            console.error('Error clearing state:', error);
        }
    };

    const deleteModel = async () => {
        try {
            await fetch('http://localhost:8000/model', { method: 'DELETE' });
            setModelTrained(false);
        } catch (error) {
            console.error('Error deleting model:', error);
        }
    };

    useEffect(() => {
        refreshStatus();
        // Poll every 5 seconds to update status
        const interval = setInterval(refreshStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppContext.Provider value={{
            datasetUploaded,
            modelTrained,
            datasetInfo,
            loading,
            refreshStatus,
            setDatasetUploaded: handleSetDatasetUploaded,
            clearAll,
            deleteModel
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppProvider');
    }
    return context;
}
