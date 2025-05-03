"use client";

import GraphGenerator from "@/components/graph-generator";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center p-4 md:p-12 "
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-5xl bg-transparent backdrop-blur-xl p-6 rounded-lg ">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">GraphsAI</h1>
        <p className="text-center text-white text-muted-foreground mb-8">
          Generate mathematical graphs from natural language prompts
        </p>
        <GraphGenerator />
      </div>
      <footer className="w-full bg-transparent text-white text-center py-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} Created by Purvai Patil.</p>
        <p className="text-sm">All rights reserved.</p>
      </footer>
    </main>
  );
}
