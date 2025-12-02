"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBanner } from "@/components/StatusBanner";
import { useAppState } from "@/context/AppContext";
import { Activity, Brain, Zap, ArrowRight, Server, Database } from "lucide-react";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("checking...");
  const { modelTrained, datasetUploaded } = useAppState();
  const [modelStatus, setModelStatus] = useState<{ loaded: boolean; name: string | null }>({
    loaded: false,
    name: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const healthRes = await fetch("http://localhost:8000/health");
        const healthData = await healthRes.json();
        setHealthStatus(healthData.status);

        const statusRes = await fetch("http://localhost:8000/status");
        const statusData = await statusRes.json();
        setModelStatus({
          loaded: statusData.model_loaded,
          name: statusData.model_name,
        });
      } catch (error) {
        setHealthStatus("error");
        console.error("Failed to fetch status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Upload Dataset",
      description: "Upload your .pkl dataset.",
      icon: <Database className="w-8 h-8 text-emerald-400" />,
      href: "/upload",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "group-hover:border-emerald-500/50"
    },
    {
      title: "Train Model",
      description: "Configure hyperparameters and train your neural network with real-time progress tracking.",
      icon: <Brain className="w-8 h-8 text-indigo-400" />,
      href: "/train",
      color: "from-indigo-500/20 to-purple-500/20",
      borderColor: "group-hover:border-indigo-500/50"
    },
    {
      title: "Make Predictions",
      description: "Get instant predictions from your trained model.",
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      href: "/predict",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "group-hover:border-amber-500/50"
    },
  ];

  return (
    // Added 'mx-auto' here to center the main container on the screen
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-6 relative">
      {/* System Status */}
      <div className="absolute top-0 left-0">
        <Card className="flex items-center gap-2 px-3 py-1.5 w-auto group border-none shadow-none bg-transparent">
          <div className={`w-2 h-2 rounded-full ${healthStatus === "healthy" ? "bg-emerald-500 shadow-[0_0_6px_#10B981]" : "bg-red-500"} animate-pulse`} />
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className={`text-xs font-bold ${healthStatus === "healthy" ? "text-emerald-500" : "text-red-500"}`}>
              {healthStatus === "healthy" ? "API Online" : "API Offline"}
            </span>
          </div>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold font-heading tracking-tight">
          <span className="text-gradient-primary">Home</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          An app for training and applying 5D neural networks.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link href="/upload">
            <Button size="lg" className="shadow-lg shadow-indigo-500/25">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="https://c1cw-5dneuralnet.readthedocs.io/en/latest/" target="_blank">
            <Button variant="outline" size="lg">
              API Docs
            </Button>
          </Link>
        </div>
      </div>

      <StatusBanner />

      {/* Features Grid */}
      {/* Added 'max-w-4xl mx-auto' to constrain width and center the grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group">
            <Card className={`h-full hover:-translate-y-1 transition-transform duration-300 border-transparent hover:border-[var(--primary)]/30`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 font-heading">
                {feature.title}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}