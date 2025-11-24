"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import { StatusBanner } from "@/components/StatusBanner";

export default function PredictPage() {
    const [predicting, setPredicting] = useState(false);
    const [predictionResult, setPredictionResult] = useState<{
        prediction: number;
        confidence: number;
        inputs: number[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 5 input fields for the 5D features
    const [features, setFeatures] = useState<string[]>(["", "", "", "", ""]);

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const handlePredict = async () => {
        // Validate inputs
        if (features.some(f => f === "")) {
            setError("Please fill in all 5 input fields");
            return;
        }

        const featureVector = features.map(f => parseFloat(f));
        if (featureVector.some(isNaN)) {
            setError("All inputs must be valid numbers");
            return;
        }

        setPredicting(true);
        setError(null);
        setPredictionResult(null);

        const API_URL = 'http://localhost:8000';

        try {
            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feature_vector: featureVector,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setPredictionResult({
                    prediction: result.prediction,
                    confidence: result.confidence || 1.0,
                    inputs: featureVector
                });
            } else {
                setError(result.detail || 'Prediction failed');
            }
        } catch (error: any) {
            setError('Error making prediction: ' + error.message);
        } finally {
            setPredicting(false);
        }
    };

    const handleReset = () => {
        setFeatures(["", "", "", "", ""]);
        setPredictionResult(null);
        setError(null);
    };

    const handleRandomize = () => {
        // Generate random values between -2 and 2 for each feature
        const randomFeatures = Array.from({ length: 5 }, () =>
            (Math.random() * 4 - 2).toFixed(3)
        );
        setFeatures(randomFeatures);
        setPredictionResult(null);
        setError(null);
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-[var(--primary)] font-bold">Make Prediction</span>
                </h1>
                <p className="text-foreground-secondary">
                    Input 5 feature values to get a prediction from your trained model
                </p>
            </div>

            <StatusBanner />

            <div className="grid grid-cols-1 gap-10">
                {/* Input Form */}
                <Card variant="default" title="Feature Inputs" description="Enter values for all 5 features">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((value, index) => (
                            <Input
                                key={index}
                                label={`Feature ${index + 1}`}
                                type="number"
                                step="any"
                                value={value}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`Enter value for feature ${index + 1}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-8 mt-6">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handlePredict}
                            disabled={predicting}
                            isLoading={predicting}
                            className="flex-1"
                        >
                            {predicting ? 'Predicting...' : 'Get Prediction'}
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={handleRandomize}
                            disabled={predicting}
                        >
                            🎲 Randomize
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleReset}
                            disabled={predicting}
                        >
                            Reset
                        </Button>
                    </div>
                </Card>

                {/* Error Display */}
                {error && (
                    <Card variant="default">
                        <div className="p-4 rounded-lg border bg-[var(--error)] bg-opacity-10 border-[var(--error)] text-[var(--error)]">
                            <p className="font-medium">{error}</p>
                        </div>
                    </Card>
                )}

                {/* Prediction Result */}
                {predictionResult && (
                    <Card variant="default">
                        <div className="text-center py-8">
                            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] mb-8">
                                <p className="text-sm text-white opacity-80 mb-2">Prediction Result</p>
                                <p className="text-5xl font-bold text-white">
                                    {predictionResult.prediction.toFixed(4)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                                    <p className="text-sm text-foreground-secondary mb-1">Confidence</p>
                                    <p className="text-2xl font-bold text-[var(--primary)] font-bold">
                                        {(predictionResult.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                                    <p className="text-sm text-foreground-secondary mb-1">Input Features</p>
                                    <p className="text-2xl font-bold text-[var(--primary)] font-bold">
                                        {predictionResult.inputs.length}D
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] text-left">
                                <p className="text-sm font-semibold text-foreground-secondary mb-2">Input Values:</p>
                                <div className="flex flex-wrap gap-2">
                                    {predictionResult.inputs.map((value, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full bg-[var(--primary)] bg-opacity-20 text-foreground text-sm"
                                        >
                                            F{index + 1}: {value.toFixed(4)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
