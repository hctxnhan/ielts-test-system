"use client";
import React from "react";
import type { Test } from "@testComponents/lib/types";
import TestPlayerContainer from "./test-player-container";

interface TestPlayerProps {
  test: Test;
  onBack?: () => void;
  params?: {
    id: string
  }
}

export default function TestPlayer({ params, test, onBack }: TestPlayerProps) {
  return <TestPlayerContainer params = {params} test={test} onBack={onBack} />;
}
