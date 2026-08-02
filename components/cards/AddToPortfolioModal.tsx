"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/forms/FormField";
import SelectField from "@/components/forms/SelectField";
import type { PokemonCard } from "@/lib/types";

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

const conditionOptions: Array<[string, string]> = [
  ["NM", "Near Mint"],
  ["LP", "Lightly Played"],
  ["MP", "Moderately Played"],
  ["HP", "Heavily Played"],
  ["DMG", "Damaged"],
];

const gradingCompanyOptions: Array<[string, string]> = [
  ["Raw", "Raw / Ungraded"],
  ["PSA", "PSA"],
  ["CGC", "CGC"],
  ["BGS", "BGS"],
  ["ACE", "ACE"],
  ["Other", "Other"],
];

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeDisabled={saving}
      maxWidth="3xl"
      eyebrow="Add to portfolio"
      title={card.name}
      description={`${card.set.name} · Card #${card.number}`}
      media={
        <img
          src={card.images.small}
          alt={`${card.name} Pokémon card`}
          className="h-24 w-auto rounded-lg object-contain"
        />
      }
    >
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
          />

          <SelectField
            label="Condition"
            name="condition"
            value={form.condition}
            onChange={updateField}
            options={conditionOptions}
          />

          <SelectField
            label="Grading company"
            name="gradingCompany"
            value={form.gradingCompany}
            onChange={updateField}
            options={gradingCompanyOptions}
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
              className="mb-2 block text-sm font-semibold text-foreground"
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
              className="w-full resize-none rounded-xl border border-border-strong bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-subtle focus:border-brand"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save to portfolio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
