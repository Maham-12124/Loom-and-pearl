"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface PackagingTypeItem {
  id: string;
  name: string;
}

type FormState = { id?: string; name: string };
const emptyForm: FormState = { name: "" };

export function PackagingTypeManager({ initialTypes }: { initialTypes: PackagingTypeItem[] }) {
  const [types, setTypes] = useState(initialTypes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openEdit = (type: PackagingTypeItem) => {
    setForm({ id: type.id, name: type.name });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        form.id ? `/api/admin/packaging-types/${form.id}` : "/api/admin/packaging-types",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save this packaging type.");
        return;
      }
      setTypes((prev) => (form.id ? prev.map((t) => (t.id === data.id ? data : t)) : [data, ...prev]));
      toast.success(form.id ? "Type updated" : "Type added");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/packaging-types/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Could not delete this packaging type.");
      return;
    }
    setTypes((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Packaging Types</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={() => setForm(emptyForm)} />}>
            <Plus className="h-4 w-4" /> Add Type
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{form.id ? "Edit Type" : "New Type"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Silk Ribbon Box"
                />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving || !form.name}>
                {saving ? "Saving…" : "Save Type"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(type)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
