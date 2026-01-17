"use client";
import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
}

