"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Card = {
  id: number;
  name: string;
  set: string;
  buy_price: number;
  grading_cost: number;
  psa9_value: number;
  psa10_value: number;
  status: string;
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b36a]-400">
              Portfolio
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {isEditing ? "Edit card" : "Add a new card"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Update the card details and save your changes."
                : "Enter the purchase, grading and projected value details."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

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
            />

            <FormField
              label="Grading cost"
              name="grading_cost"
              value={form.grading_cost}
              onChange={updateField}
              placeholder="0.00"
              type="number"
            />

            <FormField
              label="PSA 9 value"
              name="psa9_value"
              value={form.psa9_value}
              onChange={updateField}
              placeholder="0.00"
              type="number"
            />

            <FormField
              label="PSA 10 value"
              name="psa10_value"
              value={form.psa10_value}
              onChange={updateField}
              placeholder="0.00"
              type="number"
            />

            <div className="md:col-span-2">
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              >
                <option value="Watching">Watching</option>
                <option value="Bought">Bought</option>
                <option value="Sent">Sent for grading</option>
                <option value="Graded">Graded</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="mt-7 flex justify-end gap-3 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xlbg-[#d6b36a] px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Save card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  type?: string;
  required?: boolean;
};

function FormField({
  label,
  name,
  value,
  placeholder,
  onChange,
  type = "text",
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400"
      />
    </div>
  );
}
