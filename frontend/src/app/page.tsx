"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("Loading...");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dataStats, setDataStats] = useState<{ X: number[], y: number[] } | null>(null);

  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Error connecting to backend"));
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Error connecting to backend: ' + error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus(null);
      setDataStats(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('Upload success: ' + result.message);
        setDataStats(result.data_shape);
      } else {
        setUploadStatus('Upload failed: ' + result.detail);
      }
    } catch (error: any) {
      setUploadStatus('Error during upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="bg-white shadow rounded-lg p-6 w-full mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Upload</h2>
          <p className="text-gray-600 mb-4">
            Upload a .pkl dataset to get started.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pkl"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-4 py-2 rounded text-white font-semibold ${!selectedFile || uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded ${uploadStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {uploadStatus}
            </div>
          )}
          {dataStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium text-gray-900">Dataset Statistics</h3>
              <p className="text-sm text-gray-600">X shape: {dataStats.X.join(' x ')}</p>
              <p className="text-sm text-gray-600">y shape: {dataStats.y.join(' x ')}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-between items-center">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Backend: {status}</span>
            </div>
          </div>

          <button
            onClick={testBackendConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-fit"
          >
            Test Backend Connection
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-12">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
