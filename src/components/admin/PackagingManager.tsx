"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PackagingOptionData, PackagingType } from "@/types/customizer";
import { formatPKR } from "@/lib/currency";
import { TypeSelectWithAdd, TypeOption } from "./TypeSelectWithAdd";
import { ImageUrlField } from "./ImageUrlField";

const TYPE_LABEL: Record<string, string> = {
  VELVET_POUCH: "Velvet Pouch",
  LUXURY_BOX: "Luxury Box",
  GIFT_CARD_NOTE: "Gift Card Note",
};

type FormState = {
  id?: string;
  name: string;
  type: PackagingType;
  imageUrl: string;
  price: string;
  isActive: boolean;
};

export function PackagingManager({
  initialOptions,
  initialPackagingTypes,
}: {
  initialOptions: PackagingOptionData[];
  initialPackagingTypes: TypeOption[];
}) {
  const [options, setOptions] = useState(initialOptions);
  const [packagingTypes, setPackagingTypes] = useState(initialPackagingTypes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    type: initialPackagingTypes[0]?.name ?? "",
    imageUrl: "",
    price: "400",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm({ name: "", type: packagingTypes[0]?.name ?? "", imageUrl: "", price: "400", isActive: true });
    setOpen(true);
  };

  const openEdit = (opt: PackagingOptionData) => {
    setForm({
      id: opt.id,
      name: opt.name,
      type: opt.type,
      imageUrl: opt.imageUrl ?? "",
      price: String(opt.price),
      isActive: opt.isActive,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type,
      imageUrl: form.imageUrl || null,
      price: Number(form.price),
      isActive: form.isActive,
    };
    try {
      const res = await fetch(form.id ? `/api/admin/packaging/${form.id}` : "/api/admin/packaging", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setOptions((prev) => (form.id ? prev.map((o) => (o.id === saved.id ? saved : o)) : [saved, ...prev]));
      toast.success(form.id ? "Packaging updated" : "Packaging added");
      setOpen(false);
    } catch {
      toast.error("Could not save this packaging option.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/admin/packaging/${id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Gift Packaging</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={openCreate} />}>
            <Plus className="h-4 w-4" /> Add Option
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{form.id ? "Edit Option" : "New Packaging Option"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TypeSelectWithAdd
                  label="Type"
                  value={form.type}
                  onChange={(v) => setForm({ ...form, type: v })}
                  options={packagingTypes}
                  onOptionsChange={setPackagingTypes}
                  createEndpoint="/api/admin/packaging-types"
                />
                <div className="space-y-1.5">
                  <Label>Price (Rs.)</Label>
                  <Input
                    type="number"
                    step="10"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>
              <ImageUrlField
                label="Image (optional)"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
              <Button className="w-full" onClick={handleSave} disabled={saving || !form.name || !form.type}>
                {saving ? "Saving…" : "Save Option"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((opt) => (
            <TableRow key={opt.id}>
              <TableCell className="font-medium">{opt.name}</TableCell>
              <TableCell className="text-muted-foreground">{TYPE_LABEL[opt.type] ?? opt.type}</TableCell>
              <TableCell>{formatPKR(opt.price)}</TableCell>
              <TableCell>
                <Badge variant={opt.isActive ? "default" : "secondary"}>
                  {opt.isActive ? "Visible" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(opt)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(opt.id)}>
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
