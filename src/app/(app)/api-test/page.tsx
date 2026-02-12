"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, RefreshCw, Server, Database, Shield, Music } from "lucide-react";

interface TestResult {
  name: string;
  endpoint: string;
  status: "pending" | "success" | "error";
  message: string;
  responseTime?: number;
  data?: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://beta.test/api";

export default function ApiTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "API Health Check", endpoint: "/health", status: "pending", message: "Waiting..." },
    { name: "CSRF Cookie", endpoint: "/sanctum/csrf-cookie", status: "pending", message: "Waiting..." },
    { name: "Genres List", endpoint: "/music/genres", status: "pending", message: "Waiting..." },
    { name: "Songs List", endpoint: "/music/songs", status: "pending", message: "Waiting..." },
    { name: "Artists List", endpoint: "/music/artists", status: "pending", message: "Waiting..." },
    { name: "Albums List", endpoint: "/music/albums", status: "pending", message: "Waiting..." },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<"pending" | "success" | "partial" | "error">("pending");

  async function runTest(index: number): Promise<TestResult> {
    const test = tests[index];
    const startTime = performance.now();
    
    try {
      let url = API_URL + test.endpoint;
      
      // CSRF cookie requires different handling
      if (test.endpoint === "/sanctum/csrf-cookie") {
        url = API_URL.replace("/api/api", "") + test.endpoint;
      }
      
      // Health check - try root first
      if (test.endpoint === "/health") {
        url = API_URL.replace("/api/api", "") + "/api" + test.endpoint;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (response.ok || response.status === 204) {
        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
        }

        return {
          ...test,
          status: "success",
          message: `OK (${response.status})`,
          responseTime,
          data,
        };
      } else {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
        
        return {
          ...test,
          status: "error",
          message: errorMessage,
          responseTime,
        };
      }
    } catch (error) {
      return {
        ...test,
        status: "error",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  async function runAllTests() {
    setIsRunning(true);
    setOverallStatus("pending");
    
    // Reset tests
    setTests((prev) =>
      prev.map((t) => ({ ...t, status: "pending" as const, message: "Testing..." }))
    );

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(i);
      results.push(result);
      setTests((prev) => {
        const updated = [...prev];
        updated[i] = result;
        return updated;
      });
      
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Calculate overall status
    const successCount = results.filter((r) => r.status === "success").length;
    if (successCount === results.length) {
      setOverallStatus("success");
    } else if (successCount > 0) {
      setOverallStatus("partial");
    } else {
      setOverallStatus("error");
    }

    setIsRunning(false);
  }

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">API Connection Test</h1>
            <p className="text-muted-foreground">
              Testing connection to: <code className="bg-muted px-2 py-1 rounded">{API_URL}</code>
            </p>
          </div>
        </div>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Testing..." : "Re-run Tests"}
        </button>
      </div>

      {/* Overall Status */}
      <div
        className={`rounded-xl p-6 mb-8 border-2 ${
          overallStatus === "success"
            ? "bg-green-500/10 border-green-500/50"
            : overallStatus === "partial"
            ? "bg-yellow-500/10 border-yellow-500/50"
            : overallStatus === "error"
            ? "bg-red-500/10 border-red-500/50"
            : "bg-muted border-muted"
        }`}
      >
        <div className="flex items-center gap-4">
          {overallStatus === "success" && (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
          {overallStatus === "partial" && (
            <Shield className="h-12 w-12 text-yellow-500" />
          )}
          {overallStatus === "error" && (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
          {overallStatus === "pending" && (
            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {overallStatus === "success" && "All Tests Passed!"}
              {overallStatus === "partial" && "Partial Connection"}
              {overallStatus === "error" && "Connection Failed"}
              {overallStatus === "pending" && "Running Tests..."}
            </h2>
            <p className="text-muted-foreground">
              {overallStatus === "success" &&
                "Backend is fully connected and responding."}
              {overallStatus === "partial" &&
                "Some endpoints are working. Check failed tests below."}
              {overallStatus === "error" &&
                "Cannot connect to backend. Check if Laravel server is running."}
              {overallStatus === "pending" && "Please wait while we test the connection..."}
            </p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Endpoint Tests
        </h3>

        {tests.map((test, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              test.status === "success"
                ? "bg-green-500/5 border-green-500/30"
                : test.status === "error"
                ? "bg-red-500/5 border-red-500/30"
                : "bg-muted/50 border-muted"
            }`}
          >
            <div className="flex items-center gap-3">
              {test.status === "success" && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {test.status === "error" && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {test.status === "pending" && (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              )}
              <div>
                <p className="font-medium">{test.name}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {test.endpoint}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-medium ${
                  test.status === "success"
                    ? "text-green-500"
                    : test.status === "error"
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {test.message}
              </p>
              {test.responseTime && (
                <p className="text-xs text-muted-foreground">
                  {test.responseTime}ms
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data Preview */}
      {tests.some((t) => t.status === "success" && t.data) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Music className="h-5 w-5" />
            Sample Data
          </h3>
          <div className="space-y-4">
            {tests
              .filter((t) => t.status === "success" && t.data)
              .slice(0, 3)
              .map((test, index) => (
                <div key={index} className="rounded-lg border bg-card p-4">
                  <p className="font-medium mb-2">{test.name}</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      {overallStatus === "error" && (
        <div className="mt-8 rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Troubleshooting</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>
                Make sure Laravel is running at <code className="bg-muted px-1 rounded">http://beta.test</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>
                Configure CORS in <code className="bg-muted px-1 rounded">config/cors.php</code> to allow{" "}
                <code className="bg-muted px-1 rounded">http://localhost:3000</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>
                Add <code className="bg-muted px-1 rounded">localhost:3000</code> to Sanctum stateful domains
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>4.</span>
              <span>Check browser console for CORS errors</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
