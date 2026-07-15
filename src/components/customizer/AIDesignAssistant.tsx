"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomizer } from "@/context/CustomizerContext";
import type { BeadFinish } from "@/types/customizer";
import { toast } from "sonner";

interface AIDesignResponse {
  beads: { hexCode: string; finish: BeadFinish }[];
  summary: string;
}

export function AIDesignAssistant() {
  const { design, applyPalette } = useCustomizer();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (prompt.trim().length < 3) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, beadCount: design.beads.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong generating your design.");
        return;
      }
      const { beads, summary } = data as AIDesignResponse;
      applyPalette(beads);
      toast.success("Design generated", { description: summary });
    } catch {
      toast.error("Could not reach the AI design assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Design Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder='e.g. "Design a minimal bracelet matching a black velvet dress with a hint of gold"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          maxLength={300}
        />
        <Button className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Designing…" : "Generate Design"}
        </Button>
      </CardContent>
    </Card>
  );
}
