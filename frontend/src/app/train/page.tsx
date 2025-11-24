"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";
import { Play, Settings, Activity, ArrowRight, CheckCircle2 } from "lucide-react";

export default function TrainPage() {
    const [epochs, setEpochs] = useState(100);
    const [batchSize, setBatchSize] = useState(32);
    const [learningRate, setLearningRate] = useState(0.001);
    const [hiddenSize, setHiddenSize] = useState(64);
    const [training, setTraining] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [finalLoss, setFinalLoss] = useState<number | null>(null);
    const router = useRouter();
    const { datasetUploaded, refreshStatus } = useAppState();

    // Poll for training status
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (training) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch("http://localhost:8000/status");
                    const data = await res.json();

                    if (data.training_state) {
                        if (data.training_state.training) {
                            setStatus(`Training in progress... (Epoch ${data.training_state.current_epoch}/${data.training_state.total_epochs})`);
                        } else if (data.training_state.error) {
                            setTraining(false);
                            setStatus(`Error: ${data.training_state.error}`);
                            refreshStatus();
                        } else if (data.training_state.final_loss !== null) {
                            // Training finished successfully
                            setTraining(false);
                            setStatus("Training complete!");
                            setFinalLoss(data.training_state.final_loss);
                            refreshStatus();
                        }
                    }
                } catch (error) {
                    console.error("Error polling status:", error);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [training, refreshStatus]);

    const handleTrain = async () => {
        if (!datasetUploaded) {
            alert("Please upload a dataset first");
            router.push("/upload");
            return;
        }

        setTraining(true);
        setStatus("Initializing training...");
        setFinalLoss(null);

        try {
            const response = await fetch("http://localhost:8000/train", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    epochs,
                    batch_size: batchSize,
                    learning_rate: learningRate,
                    hidden_size: hiddenSize,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Training failed");
            }

            // Training started successfully, polling will take over
            setStatus("Training started...");

        } catch (error: any) {
            setStatus(`Error: ${error.message}`);
            setTraining(false);
        }
    };

    return (
        <div className="w-full max-w-4xl animate-fade-in space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
                    Train Model
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                    Configure hyperparameters and train your neural network on the uploaded dataset.
                </p>
            </div>

            <StatusBanner />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Hyperparameters" className="relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Epochs"
                                type="number"
                                value={epochs}
                                onChange={(e) => setEpochs(Number(e.target.value))}
                                min={1}
                                max={1000}
                            />
                            <Input
                                label="Batch Size"
                                type="number"
                                value={batchSize}
                                onChange={(e) => setBatchSize(Number(e.target.value))}
                                min={1}
                                max={512}
                            />
                            <Input
                                label="Learning Rate"
                                type="number"
                                step="0.0001"
                                value={learningRate}
                                onChange={(e) => setLearningRate(Number(e.target.value))}
                                min={0.0001}
                                max={0.1}
                            />
                            <Input
                                label="Hidden Layer Size"
                                type="number"
                                value={hiddenSize}
                                onChange={(e) => setHiddenSize(Number(e.target.value))}
                                min={16}
                                max={512}
                            />
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={handleTrain}
                                isLoading={training}
                                disabled={!datasetUploaded}
                                className="w-full md:w-auto shadow-lg shadow-indigo-500/25"
                            >
                                <Play className="w-4 h-4 mr-2" /> Start Training
                            </Button>
                        </div>
                    </Card>

                    {status && (
                        <div className={`p-6 rounded-2xl flex items-center gap-4 animate-fade-in ${status.includes("Error")
                            ? "bg-red-500/10 border border-red-500/20 text-red-400"
                            : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                            }`}>
                            {training ? (
                                <Activity className="w-6 h-6 animate-pulse" />
                            ) : status.includes("complete") ? (
                                <CheckCircle2 className="w-6 h-6" />
                            ) : (
                                <Settings className="w-6 h-6" />
                            )}
                            <div>
                                <p className="font-medium text-lg">{status}</p>
                                {finalLoss !== null && typeof finalLoss === 'number' && (
                                    <p className="text-sm opacity-80 mt-1">Final Loss: {finalLoss.toFixed(6)}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Configuration Guide">
                        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                            <div>
                                <strong className="text-[var(--text-primary)] block mb-1">Epochs</strong>
                                Number of complete passes through the training dataset.
                            </div>
                            <div>
                                <strong className="text-[var(--text-primary)] block mb-1">Batch Size</strong>
                                Number of training examples used in one iteration.
                            </div>
                            <div>
                                <strong className="text-[var(--text-primary)] block mb-1">Learning Rate</strong>
                                Step size at each iteration while moving toward a minimum of a loss function.
                            </div>
                            <div>
                                <strong className="text-[var(--text-primary)] block mb-1">Hidden Size</strong>
                                Number of neurons in the hidden layers of the network.
                            </div>
                        </div>
                    </Card>

                    {finalLoss !== null && (
                        <Card className="bg-emerald-500/5 border-emerald-500/20 animate-fade-in">
                            <div className="text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Training Successful</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Model is ready for predictions</p>
                                </div>
                                <Button
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                    onClick={() => router.push('/predict')}
                                >
                                    Go to Predictions <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
