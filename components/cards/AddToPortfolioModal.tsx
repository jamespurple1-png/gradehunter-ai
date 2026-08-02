"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PokemonCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
  };
};

type AddToPortfolioModalProps = {
  isOpen: boolean;
  card: PokemonCard;
  onClose: () => void;
  onSaved: () => void;
};

const initialForm = {
  purchasePrice: "",
  quantity: "1",
  purchaseDate: new Date().toISOString().slice(0, 10),
  condition: "NM",
  gradingCompany: "Raw",
  grade: "",
  certificationNumber: "",
  notes: "",
};

export default function AddToPortfolioModal({
  isOpen,
  card,
  onClose,
  onSaved,
}: AddToPortfolioModalProps) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      ...initialForm,
      purchaseDate: new Date().toISOString().slice(0, 10),
    });
    setErrorMessage("");
  }, [isOpen, card.id]);

  if (!isOpen) return null;

  function updateField(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "gradingCompany" && value === "Raw"
        ? { grade: "", certificationNumber: "" }
        : {}),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const purchasePrice = Number(form.purchasePrice || 0);
    const quantity = Number(form.quantity || 1);
    const grade = form.grade ? Number(form.grade) : null;

    if (purchasePrice < 0) {
      setErrorMessage("Purchase price cannot be below zero.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage("Quantity must be a whole number of at least 1.");
      return;
    }

    if (
      form.gradingCompany !== "Raw" &&
      (grade === null || grade < 1 || grade > 10)
    ) {
      setErrorMessage("Enter a grade between 1 and 10.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setErrorMessage("Please sign in before adding cards to your portfolio.");
      return;
    }

    const { error } = await supabase.from("portfolio_items").insert({
      user_id: user.id,
      card_id: card.id,
      card_name: card.name,
      set_id: card.set.id,
      set_name: card.set.name,
      card_number: card.number,
      rarity: card.rarity ?? null,
      image_url: card.images.large || card.images.small,
      purchase_price: purchasePrice,
      quantity,
      purchase_date: form.purchaseDate,
      condition: form.condition,
      grading_company: form.gradingCompany,
      grade: form.gradingCompany === "Raw" ? null : grade,
      certification_number:
        form.gradingCompany === "Raw"
          ? null
          : form.certificationNumber.trim() || null,
      notes: form.notes.trim() || null,
    });

    if (error) {
      setSaving(false);
      setErrorMessage(error.message);
      return;
    }

    setSaving(false);
    onSaved();
  }

  function handleClose() {
    if (saving) return;
    setErrorMessage("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={card.images.small}
              alt={`${card.name} Pokémon card`}
              className="h-24 w-auto rounded-lg object-contain"
            />

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b36a]-400">
                Add to portfolio
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                {card.name}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {card.set.name} · Card #{card.number}
              </p>
            </div>
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
              label="Purchase price"
              name="purchasePrice"
              value={form.purchasePrice}
              onChange={updateField}
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
            />

            <FormField
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={updateField}
              type="number"
              placeholder="1"
              min="1"
              step="1"
            />

            <FormField
              label="Purchase date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={updateField}
              type="date"
              placeholder=""
            />

            <SelectField
              label="Condition"
              name="condition"
              value={form.condition}
              onChange={updateField}
              options={[
                ["NM", "Near Mint"],
                ["LP", "Lightly Played"],
                ["MP", "Moderately Played"],
                ["HP", "Heavily Played"],
                ["DMG", "Damaged"],
              ]}
            />

            <SelectField
              label="Grading company"
              name="gradingCompany"
              value={form.gradingCompany}
              onChange={updateField}
              options={[
                ["Raw", "Raw / Ungraded"],
                ["PSA", "PSA"],
                ["CGC", "CGC"],
                ["BGS", "BGS"],
                ["ACE", "ACE"],
                ["Other", "Other"],
              ]}
            />

            <FormField
              label="Grade"
              name="grade"
              value={form.grade}
              onChange={updateField}
              type="number"
              placeholder="10"
              min="1"
              max="10"
              step="0.5"
              disabled={form.gradingCompany === "Raw"}
            />

            <div className="md:col-span-2">
              <FormField
                label="Certification number"
                name="certificationNumber"
                value={form.certificationNumber}
                onChange={updateField}
                type="text"
                placeholder="Optional"
                disabled={form.gradingCompany === "Raw"}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={updateField}
                rows={4}
                placeholder="Seller, card condition, grading observations..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
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
              className="rounded-xl bg-[#d6b36a] px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save to portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (event: FieldChangeEvent) => void;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  disabled?: boolean;
};

function FormField({
  label,
  name,
  value,
  placeholder,
  onChange,
  type = "text",
  min,
  max,
  step,
  disabled = false,
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
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (event: FieldChangeEvent) => void;
};

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-300"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}