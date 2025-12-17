"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";
import { Play, Settings, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrainPage() {
    const [epochs, setEpochs] = useState(100);
    const [batchSize, setBatchSize] = useState(32);
    const [learningRate, setLearningRate] = useState(0.001);
    const [hiddenLayers, setHiddenLayers] = useState("64, 32, 16");
    const [training, setTraining] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [finalLoss, setFinalLoss] = useState<number | null>(null);
    const [lossHistory, setLossHistory] = useState<any[]>([]);
    const router = useRouter();
    const { datasetUploaded, refreshStatus } = useAppState();
    const statusRef = useRef<HTMLDivElement>(null);

    // Poll for training status
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (training) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch("http://localhost:8000/status");
                    const data = await res.json();

                    if (data.training_state) {
                        if (data.training_state.loss_history) {
                            setLossHistory(data.training_state.loss_history);
                        }

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
            }, 500);
        }

        return () => clearInterval(interval);
    }, [training, refreshStatus]);

    // Auto-scroll when chart appears
    useEffect(() => {
        if (lossHistory.length > 0 && training) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }, [lossHistory.length, training]);

    const handleTrain = async () => {
        if (!datasetUploaded) {
            alert("Please upload a dataset first");
            router.push("/upload");
            return;
        }

        // Validate Hyperparameters
        if (!Number.isInteger(epochs) || epochs < 1 || epochs > 1000) {
            alert("Epochs must be an integer between 1 and 1000.");
            return;
        }
        if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 512) {
            alert("Batch Size must be an integer between 1 and 512.");
            return;
        }
        if (learningRate < 0.0001 || learningRate > 1.0) {
            alert("Learning Rate must be between 0.0001 and 1.0.");
            return;
        }

        // Parse hidden layers
        let layers: number[] = [];
        try {
            const parts = hiddenLayers.split(',').map(s => s.trim()).filter(s => s !== "");
            if (parts.length === 0) throw new Error("Must specify at least one layer");

            layers = parts.map(s => {
                const val = Number(s);
                if (isNaN(val) || !Number.isInteger(val) || val <= 0) {
                    throw new Error("Invalid layer size: " + s);
                }
                return val;
            });
        } catch (e: any) {
            alert("Invalid hidden layers format. Please use positive integers separated by commas (e.g., '64, 32, 16').\nDetails: " + e.message);
            return;
        }

        setTraining(true);
        setStatus("Initializing training...");
        setFinalLoss(null);
        setLossHistory([]);

        try {
            const response = await fetch("http://localhost:8000/train", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    epochs,
                    batch_size: batchSize,
                    learning_rate: learningRate,
                    hidden_layers: layers,
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
                                label="Hidden Layers (comma separated)"
                                type="text"
                                value={hiddenLayers}
                                onChange={(e) => setHiddenLayers(e.target.value)}
                                placeholder="e.g. 64, 32, 16"
                            />
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={handleTrain}
                                isLoading={training}
                                disabled={!datasetUploaded}
                                className="w-full md:w-auto shadow-lg shadow-indigo-500/25"
                                loadingText="Training..."
                            >
                                <Play className="w-4 h-4 mr-2" /> Start Training
                            </Button>
                        </div>
                    </Card>

                    {status && (
                        <div ref={statusRef} className="space-y-6 animate-fade-in">
                            <div className={`p-6 rounded-2xl flex items-center gap-4 ${status.includes("Error")
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
                                <div className="flex-1">
                                    <p className="font-medium text-lg">{status}</p>
                                    {finalLoss !== null && typeof finalLoss === 'number' && (
                                        <p className="text-sm opacity-80 mt-1">Final Loss: {finalLoss.toFixed(6)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {training && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                                        <span>Progress</span>
                                        <span>{Math.round((lossHistory.length / epochs) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-[var(--surface-highlight)] h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--primary)] transition-all duration-300 ease-out"
                                            style={{ width: `${(lossHistory.length / epochs) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Loss Chart */}
                            {lossHistory.length > 0 && (
                                <Card title="Training Loss" className="h-[400px] flex flex-col">
                                    <div className="w-full flex-1 min-h-0 -ml-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={lossHistory}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                                                <XAxis
                                                    dataKey="epoch"
                                                    stroke="var(--text-tertiary)"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="var(--text-tertiary)"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    domain={['auto', 'auto']}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--surface)',
                                                        borderColor: 'var(--border)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    itemStyle={{ color: 'var(--text-primary)' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="loss"
                                                    stroke="var(--primary)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4, fill: 'var(--primary)' }}
                                                    animationDuration={300}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Configuration Guide">
                        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                            <div>
                                <strong className="text-[var(--text-primary)] block mb-1">Epochs</strong>
                                Number of complete passes through the training dataset. Uses early stopping.
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
                                <strong className="text-[var(--text-primary)] block mb-1">Hidden Layers</strong>
                                Comma-separated list of neurons per layer (e.g., "64, 32, 16").
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
