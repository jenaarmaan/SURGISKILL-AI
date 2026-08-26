"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <html lang="en">
      <head>
        <title>SurgiSkill AI — Digital OSCE Surgical Skill Assessment</title>
        <meta name="description" content="AI-Powered Surgical Skill Analysis, Objective Hand Tracking, and Clinical Assessment Platform" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
