"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Wand2, Plus } from "lucide-react";
import { toast } from "sonner";
import { WRIST_SIZE_LABEL, WristSize } from "@/types/customizer";

interface FriendProfile {
  id: string;
  name: string;
  wristInches: number | null;
  wristSize: string;
  preferences: string | null;
}

export function FriendProfileManager({ initialProfiles }: { initialProfiles: FriendProfile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [wristInches, setWristInches] = useState("");
  const [wristSize, setWristSize] = useState<WristSize>("MEDIUM");
  const [preferences, setPreferences] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/friend-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          wristSize,
          wristInches: wristInches ? Number(wristInches) : undefined,
          preferences: preferences || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setProfiles((prev) => [created, ...prev]);
      setOpen(false);
      setName("");
      setWristInches("");
      setPreferences("");
      toast.success(`Saved profile for ${created.name}`);
    } catch {
      toast.error("Could not save this profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/friend-profiles/${id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div>
              <p className="font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">
                {WRIST_SIZE_LABEL[profile.wristSize as WristSize] ?? profile.wristSize}
                {profile.wristInches ? ` · ${profile.wristInches}"` : ""}
              </p>
              {profile.preferences && (
                <p className="text-xs italic text-muted-foreground">“{profile.preferences}”</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/customize?size=${profile.wristSize}`}
                title="Start a design for them"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <Wand2 className="h-4 w-4" />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <p className="text-sm text-muted-foreground">No saved profiles yet.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
          <Plus className="h-4 w-4" /> Add a Profile
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">New Friend Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Wrist Size</Label>
                <Select value={wristSize} onValueChange={(v) => setWristSize(v as WristSize)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(WRIST_SIZE_LABEL) as WristSize[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {WRIST_SIZE_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Wrist (inches)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={wristInches}
                  onChange={(e) => setWristInches(e.target.value)}
                  placeholder="6.5"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Preferences</Label>
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Prefers pastels, loves pearl finishes…"
                rows={2}
              />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
