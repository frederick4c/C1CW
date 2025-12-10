"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";
import { Zap, Shuffle, ArrowRight, AlertCircle } from "lucide-react";

export default function PredictPage() {
    const [features, setFeatures] = useState<string[]>(["", "", "", "", ""]);
    const [prediction, setPrediction] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { modelTrained } = useAppState();

    const handleInputChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
        setError(null);
    };

    const handleRandomize = () => {
        const randomFeatures = Array(5).fill(0).map(() => (Math.random() * 4 - 2).toFixed(3));
        setFeatures(randomFeatures);
        setError(null);
        setPrediction(null);
    };

    const handlePredict = async () => {
        if (!modelTrained) {
            alert("Please train a model first");
            router.push("/train");
            return;
        }

        // Validate inputs
        if (features.some(f => f.trim() === "" || isNaN(Number(f)) || !isFinite(Number(f)))) {
            setError("Please enter valid finite numbers for all features");
            return;
        }

        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    feature_vector: features.map(Number),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const detail = data.detail;
                const message = typeof detail === 'object' ? JSON.stringify(detail) : (detail || "Prediction failed");
                throw new Error(message);
            }

            setPrediction(data.prediction);
        } catch (error: any) {
            console.error("Prediction error:", error);
            setError(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl animate-fade-in space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
                    Make Predictions
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                    Enter feature values to get real-time predictions from your trained neural network.
                </p>
            </div>

            <StatusBanner />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Input Features" className="relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <Input
                                    key={index}
                                    label={`Feature ${index + 1}`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    value={feature}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                />
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={handleRandomize}
                                className="flex-1"
                                disabled={loading}
                            >
                                <Shuffle className="w-4 h-4 mr-2" /> Randomize
                            </Button>
                            <Button
                                onClick={handlePredict}
                                isLoading={loading}
                                disabled={!modelTrained}
                                className="flex-[2] shadow-lg shadow-amber-500/25 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                            >
                                <Zap className="w-4 h-4 mr-2" /> Predict
                            </Button>
                        </div>
                    </Card>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Prediction Result" className="h-full flex flex-col justify-center items-center text-center min-h-[300px]">
                        {prediction !== null ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                                    <div className="relative text-6xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                        {prediction.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[var(--text-tertiary)] space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--surface-highlight)] flex items-center justify-center mx-auto">
                                    <Zap className="w-8 h-8 opacity-20" />
                                </div>
                                <p>Enter features and click predict to see results</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
