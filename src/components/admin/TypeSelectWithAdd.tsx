"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export interface TypeOption {
  id: string;
  name: string;
}

const ADD_NEW = "__add_new__";

/** A <Select> of admin-manageable named types (bead finishes, packaging types)
 * with an inline "Add new…" option that creates the type on the fly without
 * leaving the current form. */
export function TypeSelectWithAdd({
  label,
  value,
  onChange,
  options,
  onOptionsChange,
  createEndpoint,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
  options: TypeOption[];
  onOptionsChange: (options: TypeOption[]) => void;
  createEndpoint: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await fetch(createEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not add this option.");
        return;
      }
      onOptionsChange([data, ...options]);
      onChange(data.name);
      setNewName("");
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) => {
          if (!v) return;
          if (v === ADD_NEW) setAddOpen(true);
          else onChange(v);
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.name}>
              {opt.name}
            </SelectItem>
          ))}
          <SelectItem value={ADD_NEW} className="gap-1.5 text-primary">
            <Plus className="h-3.5 w-3.5" /> Add new…
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">New {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              autoFocus
            />
            <Button className="w-full" onClick={handleAdd} disabled={saving || !newName}>
              {saving ? "Saving…" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
