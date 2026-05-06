"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0b0f1f",
            color: "#dee3f1",
            border: "1px solid #1a2244",
          },
        }}
      />
    </SessionProvider>
  );
}
