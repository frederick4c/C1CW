"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { StatusBanner } from "@/components/StatusBanner";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("Loading...");
  const [modelStatus, setModelStatus] = useState<{ loaded: boolean; name: string | null } | null>(null);

  useEffect(() => {
    const API_URL = 'http://localhost:8000';

    // Check health
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch(() => setHealthStatus("Error"));

    // Check model status
    fetch(`${API_URL}/status`)
      .then((res) => res.json())
      .then((data) => setModelStatus(data))
      .catch(() => setModelStatus({ loaded: false, name: null }));
  }, []);

  const features = [
    {
      title: "Upload Dataset",
      description: "Upload .pkl datasets for model training with automatic validation",
      icon: "📤",
      href: "/upload",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Train Model",
      description: "Configure hyperparameters and train your neural network",
      icon: "🎯",
      href: "/train",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Make Predictions",
      description: "Get real-time predictions from your trained model",
      icon: "🔮",
      href: "/predict",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-[var(--primary)] font-bold">5D Neural Network</span>
        </h1>
        <p className="text-xl text-foreground-secondary max-w-2xl">
          A modern, intuitive interface for training and deploying machine learning models with ease.
        </p>
      </div>

      <StatusBanner />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <Card variant="default" className="animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary mb-1">Backend Status</p>
              <p className="text-2xl font-bold text-foreground">{healthStatus}</p>
            </div>
            <div className={`w-4 h-4 rounded-full ${healthStatus === 'healthy' ? 'bg-[var(--success)]' : 'bg-[var(--error)]'} animate-pulse`}></div>
          </div>
        </Card>

        <Card variant="default" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-secondary mb-1">Model Status</p>
              <p className="text-2xl font-bold text-foreground">
                {modelStatus?.loaded ? 'Loaded' : 'Not Loaded'}
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full ${modelStatus?.loaded ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'} animate-pulse`}></div>
          </div>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link key={feature.href} href={feature.href}>
              <Card
                variant="default"
                className="h-full hover:scale-105 cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-4xl mb-4 group-hover:shadow-xl transition-shadow`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-secondary text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="default">
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/upload">
            <Button variant="primary">Upload Dataset</Button>
          </Link>
          <Link href="/train">
            <Button variant="secondary">Start Training</Button>
          </Link>
          <Link href="/predict">
            <Button variant="outline">Make Prediction</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

