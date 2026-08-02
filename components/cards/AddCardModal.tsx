"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import SelectField from "@/components/forms/SelectField";
import type { Card } from "@/lib/types";

type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCardSaved: () => void | Promise<void>;
  editingCard: Card | null;
};

const initialForm = {
  name: "",
  set: "",
  buy_price: "",
  grading_cost: "",
  psa9_value: "",
  psa10_value: "",
  status: "Watching",
};

type CardForm = typeof initialForm;

const statusOptions: Array<[string, string]> = [
  ["Watching", "Watching"],
  ["Bought", "Bought"],
  ["Sent", "Sent for grading"],
  ["Graded", "Graded"],
];

export default function AddCardModal({
  isOpen,
  onClose,
  onCardSaved,
  editingCard,
}: AddCardModalProps) {
  const [form, setForm] = useState<CardForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEditing = editingCard !== null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editingCard) {
      setForm({
        name: editingCard.name ?? "",
        set: editingCard.set ?? "",
        buy_price: String(editingCard.buy_price ?? ""),
        grading_cost: String(editingCard.grading_cost ?? ""),
        psa9_value: String(editingCard.psa9_value ?? ""),
        psa10_value: String(editingCard.psa10_value ?? ""),
        status: editingCard.status || "Watching",
      });
    } else {
      setForm(initialForm);
    }

    setErrorMessage("");
  }, [isOpen, editingCard]);

  if (!isOpen) {
    return null;
  }

  function updateField(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.set.trim()) {
      setErrorMessage("Please enter the card name and set.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const cardData = {
      name: form.name.trim(),
      set: form.set.trim(),
      buy_price: Number(form.buy_price || 0),
      grading_cost: Number(form.grading_cost || 0),
      psa9_value: Number(form.psa9_value || 0),
      psa10_value: Number(form.psa10_value || 0),
      status: form.status,
    };

    const { error } = editingCard
      ? await supabase
          .from("cards")
          .update(cardData)
          .eq("id", editingCard.id)
      : await supabase.from("cards").insert(cardData);

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await onCardSaved();

    setForm(initialForm);
    setSaving(false);
    onClose();
  }

  function handleClose() {
    if (saving) {
      return;
    }

    setErrorMessage("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeDisabled={saving}
      eyebrow="Portfolio"
      title={isEditing ? "Edit card" : "Add a new card"}
      description={
        isEditing
          ? "Update the card details and save your changes."
          : "Enter the purchase, grading and projected value details."
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Card name"
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder="Charizard ex"
            required
          />

          <FormField
            label="Set"
            name="set"
            value={form.set}
            onChange={updateField}
            placeholder="Paldean Fates"
            required
          />

          <FormField
            label="Buy price"
            name="buy_price"
            value={form.buy_price}
            onChange={updateField}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />

          <FormField
            label="Grading cost"
            name="grading_cost"
            value={form.grading_cost}
            onChange={updateField}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />

          <FormField
            label="PSA 9 value"
            name="psa9_value"
            value={form.psa9_value}
            onChange={updateField}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />

          <FormField
            label="PSA 10 value"
            name="psa10_value"
            value={form.psa10_value}
            onChange={updateField}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />

          <div className="md:col-span-2">
            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={updateField}
              options={statusOptions}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="mt-7 flex justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Save card"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
