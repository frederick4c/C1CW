"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Button, Input } from "@/components/ui";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";

export default function TrainPage() {
    const { refreshStatus } = useAppState();
    const [training, setTraining] = useState(false);
    const [trainStatus, setTrainStatus] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
        jobId?: string;
    } | null>(null);
    const [trainingProgress, setTrainingProgress] = useState<string | null>(null);

    const [epochs, setEpochs] = useState("50");
    const [batchSize, setBatchSize] = useState("32");
    const [learningRate, setLearningRate] = useState("0.001");
    const [hiddenLayers, setHiddenLayers] = useState("64,32,16");

    // Poll for training completion
    useEffect(() => {
        if (!training) return;

        const pollInterval = setInterval(async () => {
            try {
                const API_URL = 'http://localhost:8000';
                const res = await fetch(`${API_URL}/status`);
                const data = await res.json();

                if (data.model_loaded) {
                    setTraining(false);
                    setTrainStatus({
                        type: 'success',
                        message: 'Training complete! Model is now loaded.',
                        jobId: trainStatus?.jobId
                    });
                    await refreshStatus();
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Error polling training status:', error);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [training, trainStatus?.jobId, refreshStatus]);

    const handleTrain = async () => {
        setTraining(true);
        setTrainStatus({ type: 'info', message: 'Starting training...' });

        const API_URL = 'http://localhost:8000';

        try {
            const response = await fetch(`${API_URL}/train`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data_path: "path/to/default/training_data.csv",
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setTrainStatus({
                    type: 'success',
                    message: result.message,
                    jobId: result.job_id
                });
            } else {
                setTrainStatus({
                    type: 'error',
                    message: result.detail || 'Training failed to start'
                });
            }
        } catch (error: any) {
            setTrainStatus({
                type: 'error',
                message: 'Error starting training: ' + error.message
            });
        } finally {
            setTraining(false);
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
                    <span className="text-[var(--primary)] font-bold">Train Model</span>
                </h1>
                <p className="text-foreground-secondary">
                    Configure hyperparameters and start training your neural network
                </p>
            </div>

            <StatusBanner />

            <div className="grid grid-cols-1 gap-10">
                {/* Hyperparameter Configuration */}
                <Card variant="default" title="Hyperparameters" description="Configure training parameters">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Max Epochs"
                            type="number"
                            value={epochs}
                            onChange={(e) => setEpochs(e.target.value)}
                            placeholder="50"
                            helperText="Maximum number of training iterations"
                        />
                        <Input
                            label="Batch Size"
                            type="number"
                            value={batchSize}
                            onChange={(e) => setBatchSize(e.target.value)}
                            placeholder="32"
                            helperText="Number of samples per gradient update"
                        />
                        <Input
                            label="Learning Rate"
                            type="number"
                            step="0.0001"
                            value={learningRate}
                            onChange={(e) => setLearningRate(e.target.value)}
                            placeholder="0.001"
                            helperText="Step size for weight updates"
                        />
                        <Input
                            label="Hidden Layers"
                            value={hiddenLayers}
                            onChange={(e) => setHiddenLayers(e.target.value)}
                            placeholder="64,32,16"
                            helperText="Comma-separated layer sizes"
                        />
                    </div>
                </Card>

                {/* Info Card */}
                <Card variant="default">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-2xl flex-shrink-0">
                            ℹ️
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground mb-2">Training Information</h3>
                            <ul className="text-sm text-foreground-secondary space-y-1">
                                <li>• Training runs in the background</li>
                                <li>• Ensure you have uploaded a dataset first</li>
                                <li>• The model will be saved automatically upon completion</li>
                                <li>• Check the backend logs for detailed progress</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Start Training Button */}
                <Card variant="default">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleTrain}
                        disabled={training}
                        isLoading={training}
                        className="w-full"
                    >
                        {training ? 'Starting Training...' : 'Start Training'}
                    </Button>
                </Card>

                {/* Training Status */}
                {trainStatus && (
                    <Card variant="default">
                        <div className={`p-4 rounded-lg border ${statusColors[trainStatus.type]}`}>
                            <p className="font-medium mb-1">{trainStatus.message}</p>
                            {trainStatus.jobId && (
                                <p className="text-sm opacity-75">Job ID: {trainStatus.jobId}</p>
                            )}
                        </div>
                    </Card>
                )}

                {/* Next Step - Show after training completes */}
                {trainStatus && trainStatus.type === 'success' && (
                    <Card variant="default">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-foreground mb-1">Model trained successfully!</h4>
                                <p className="text-sm text-foreground-secondary">Your model is ready. Make predictions now!</p>
                            </div>
                            <Link href="/predict">
                                <Button variant="primary" size="lg">
                                    Make Predictions →
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
