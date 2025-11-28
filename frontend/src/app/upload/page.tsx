"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";
import { UploadCloud, FileText, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const [datasetInfo, setDatasetInfo] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { refreshStatus } = useAppState();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith(".pkl")) {
                setStatus({ type: "error", message: "Please upload a .pkl file" });
                return;
            }
            setFile(selectedFile);
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus({ type: "info", message: "Uploading and validating dataset..." });

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Upload failed");
            }

            setDatasetInfo(data);
            setStatus({ type: "success", message: "Dataset uploaded and validated successfully!" });
            refreshStatus(); // Update global status
        } catch (error: any) {
            setStatus({ type: "error", message: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (!droppedFile.name.endsWith(".pkl")) {
                setStatus({ type: "error", message: "Please upload a .pkl file" });
                return;
            }
            setFile(droppedFile);
            setStatus(null);
        }
    };

    return (
        <div className="w-full max-w-4xl animate-fade-in space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
                    Upload Dataset
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                    Upload your preprocessed .pkl dataset containing 5D input vectors and target values.
                </p>
            </div>

            <StatusBanner />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="relative overflow-hidden">
                        <div
                            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${file
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-highlight)]"
                                }`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pkl"
                                className="hidden"
                            />

                            <div className="flex flex-col items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${file ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--surface-highlight)] text-[var(--primary)]"
                                    }`}>
                                    {file ? <FileText className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                        {file ? file.name : "Drop your dataset here"}
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse files"}
                                    </p>
                                </div>

                                {!file && (
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4"
                                    >
                                        Select File
                                    </Button>
                                )}

                                {file && (
                                    <div className="flex gap-3 mt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => { setFile(null); setStatus(null); }}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            Remove
                                        </Button>
                                        <Button onClick={handleUpload} isLoading={uploading}>
                                            Upload Dataset
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {status && status.type !== 'success' && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 animate-fade-in ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {status.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5" />}
                            {status.type === 'info' && <Loader2 className="w-5 h-5 mt-0.5 animate-spin" />}
                            <div className="flex-1">
                                <p className="font-medium">{status.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {datasetInfo ? (
                        <Card className="animate-fade-in border-emerald-500/30 bg-emerald-500/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Upload Successful</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Dataset is ready for training</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Samples</p>
                                        <p className="text-xl font-bold font-heading text-[var(--text-primary)]">{datasetInfo.n_samples}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Features</p>
                                        <p className="text-xl font-bold font-heading text-[var(--text-primary)]">{datasetInfo.n_features}</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                    onClick={() => router.push('/train')}
                                >
                                    Proceed to Training <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card title="Requirements">
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2" />
                                    <span>File format must be <strong>.pkl</strong> (Python Pickle)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2" />
                                    <span>Must contain a dictionary with keys: <strong>'data'</strong> and <strong>'labels'</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2" />
                                    <span>Input data shape: <strong>(N, 5)</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2" />
                                    <span>Labels shape: <strong>(N, 1)</strong></span>
                                </li>
                            </ul>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
