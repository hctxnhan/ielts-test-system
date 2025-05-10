"use client";
import React from "react";
import type { Test } from "@testComponents/lib/types";
import TestPlayerContainer from "./test-player-container";

interface TestPlayerProps {
  test: Test;
  onBack?: () => void;
}

export default function TestPlayer({ test, onBack }: TestPlayerProps) {
  return <TestPlayerContainer test={test} onBack={onBack} />;
}
