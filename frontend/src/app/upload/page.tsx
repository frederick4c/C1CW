"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input } from "@/components/ui";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";

export default function UploadPage() {
    const { refreshStatus, setDatasetUploaded } = useAppState();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const [dataStats, setDataStats] = useState<{ X: number[], y: number[] } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.name.endsWith('.pkl')) {
                setSelectedFile(file);
                setUploadStatus(null);
                setDataStats(null);
            } else {
                setUploadStatus({
                    type: 'error',
                    message: 'Please select a .pkl file'
                });
            }
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            if (file.name.endsWith('.pkl')) {
                setSelectedFile(file);
                setUploadStatus(null);
                setDataStats(null);
            } else {
                setUploadStatus({
                    type: 'error',
                    message: 'Please select a .pkl file'
                });
            }
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus({
                type: 'error',
                message: 'Please select a file first.'
            });
            return;
        }

        setUploading(true);
        setUploadStatus({ type: 'info', message: 'Uploading...' });

        const formData = new FormData();
        formData.append('file', selectedFile);

        const API_URL = 'http://localhost:8000';

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setUploadStatus({
                    type: 'success',
                    message: result.message
                });
                setDataStats(result.data_shape);
                setDatasetUploaded(true); // Update global state
                await refreshStatus(); // Refresh global state
            } else {
                setUploadStatus({
                    type: 'error',
                    message: result.detail || 'Upload failed'
                });
            }
        } catch (error: any) {
            setUploadStatus({
                type: 'error',
                message: 'Error during upload: ' + error.message
            });
        } finally {
            setUploading(false);
        }
    };

    const statusColors = {
        success: 'bg-green-600 text-white border-green-600',
        error: 'bg-red-600 text-white border-red-600',
        info: 'bg-blue-600 text-white border-blue-600',
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-[var(--primary)] font-bold">Upload Dataset</span>
                </h1>
                <p className="text-foreground-secondary">
                    Upload a .pkl dataset file to train your neural network
                </p>
            </div>

            <StatusBanner />

            <Card variant="default">
                {/* Drag and Drop Area */}
                <div
                    className={`
            border-2 border-dashed rounded-xl p-12 mb-8 text-center transition-all
            ${isDragging
                            ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-10'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                        }
          `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-4xl">
                            📤
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-foreground mb-1">
                                Drop your .pkl file here
                            </p>
                            <p className="text-sm text-foreground-secondary">
                                or click below to browse
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".pkl"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="px-6 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none cursor-pointer border-2 border-[var(--border)] text-foreground hover:border-[var(--border-hover)] hover:bg-[var(--glass-bg)]"
                        >
                            Browse Files
                        </label>
                    </div>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                    <div className="mb-8 p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--primary)] bg-opacity-20 flex items-center justify-center">
                                    📄
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                                    <p className="text-sm text-foreground-secondary">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="text-foreground-secondary hover:text-[var(--error)] transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    isLoading={uploading}
                    className="w-full"
                >
                    {uploading ? 'Uploading...' : 'Upload Dataset'}
                </Button>

                {/* Upload Status */}
                {uploadStatus && (
                    <div className={`mt-6 p-4 rounded-lg border ${statusColors[uploadStatus.type]}`}>
                        <p className="font-medium">{uploadStatus.message}</p>
                    </div>
                )}

                {/* Dataset Statistics */}
                {dataStats && (
                    <div className="mt-6 p-6 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <span>📊</span>
                            Dataset Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-foreground-secondary mb-1">Features (X) Shape</p>
                                <p className="text-2xl font-bold text-[var(--primary)] font-bold">
                                    {dataStats.X.join(' × ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary mb-1">Target (y) Shape</p>
                                <p className="text-2xl font-bold text-[var(--primary)] font-bold">
                                    {dataStats.y.join(' × ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Next Step Button */}
                {dataStats && (
                    <div className="mt-6 p-6 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-foreground mb-1">Ready for the next step?</h4>
                                <p className="text-sm text-foreground-secondary">Your dataset is loaded. Start training your model!</p>
                            </div>
                            <Link href="/train">
                                <Button variant="primary" size="lg">
                                    Train Model →
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
