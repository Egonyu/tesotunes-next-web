"use client";

import { useState } from "react";
import { api, apiGet } from "@/lib/api";

interface TestResult {
  endpoint: string;
  status: "idle" | "testing" | "success" | "error";
  message: string;
  data?: unknown;
  time?: number;
}

export default function ApiDiagnosticsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    { path: "/api/health", method: "GET", label: "Health Check" },
    { path: "/api/genres", method: "GET", label: "Genres List" },
    { path: "/api/songs", method: "GET", label: "Songs List" },
    { path: "/api/artists", method: "GET", label: "Artists List" },
    { path: "/api/albums", method: "GET", label: "Albums List" },
    { path: "/api/trending", method: "GET", label: "Trending Songs" },
  ];

  const testEndpoint = async (endpoint: string, method: string): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const response = await api({
        url: endpoint,
        method,
        timeout: 10000,
      });
      const endTime = Date.now();
      
      return {
        endpoint,
        status: "success",
        message: `✅ ${response.status} ${response.statusText}`,
        data: response.data,
        time: endTime - startTime,
      };
    } catch (error: any) {
      const endTime = Date.now();
      return {
        endpoint,
        status: "error",
        message: `❌ ${error.message || "Request failed"}`,
        data: error.response?.data,
        time: endTime - startTime,
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.path, endpoint.method);
      setResults((prev) => [...prev, result]);
    }
    
    setTesting(false);
  };

  const testSingleEndpoint = async (endpoint: string, method: string) => {
    const result = await testEndpoint(endpoint, method);
    setResults((prev) => {
      const index = prev.findIndex((r) => r.endpoint === endpoint);
      if (index >= 0) {
        const newResults = [...prev];
        newResults[index] = result;
        return newResults;
      }
      return [...prev, result];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">API Diagnostics</h1>
        <p className="text-gray-400 mb-8">Testing connection from Next.js to Backend API</p>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-gray-400">Base URL:</span>{" "}
              <span className="text-green-400">{api.defaults.baseURL}</span>
            </div>
            <div>
              <span className="text-gray-400">With Credentials:</span>{" "}
              <span className="text-green-400">{String(api.defaults.withCredentials)}</span>
            </div>
            <div>
              <span className="text-gray-400">Headers:</span>{" "}
              <pre className="text-gray-300 mt-2">
                {JSON.stringify(api.defaults.headers, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={runAllTests}
            disabled={testing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {testing ? "Testing..." : "Run All Tests"}
          </button>
        </div>

        <div className="space-y-4">
          {endpoints.map((endpoint, index) => {
            const result = results.find((r) => r.endpoint === endpoint.path);
            
            return (
              <div
                key={index}
                className={`bg-gray-800 rounded-lg p-6 border-2 ${
                  result?.status === "success"
                    ? "border-green-500"
                    : result?.status === "error"
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{endpoint.label}</h3>
                    <p className="text-sm text-gray-400 font-mono">
                      {endpoint.method} {endpoint.path}
                    </p>
                  </div>
                  <button
                    onClick={() => testSingleEndpoint(endpoint.path, endpoint.method)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Test
                  </button>
                </div>

                {result && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{result.message}</span>
                      {result.time && (
                        <span className="text-sm text-gray-400">({result.time}ms)</span>
                      )}
                    </div>
                    
                    {result.data != null ? (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-4 bg-black rounded overflow-x-auto text-xs">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {results.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-green-400">
                  {results.filter((r) => r.status === "success").length}
                </div>
                <div className="text-sm text-gray-400">Passed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">
                  {results.filter((r) => r.status === "error").length}
                </div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {results.reduce((sum, r) => sum + (r.time || 0), 0) / results.length}ms
                </div>
                <div className="text-sm text-gray-400">Avg Response Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
