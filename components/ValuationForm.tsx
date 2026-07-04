"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "./CheckIcon";
import styles from "./ValuationForm.module.css";

interface ValuationFormData {
  name: string;
  contact: string;
  suburb: string;
  timeline: string;
}

const initialForm: ValuationFormData = {
  name: "",
  contact: "",
  suburb: "",
  timeline: "Just curious",
};

export function ValuationForm() {
  const [form, setForm] = useState<ValuationFormData>(initialForm);
  const [errors, setErrors] = useState<{ name?: boolean; contact?: boolean }>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof ValuationFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" || field === "contact") {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      name: form.name.trim() === "",
      contact: form.contact.trim() === "",
    };

    if (nextErrors.name || nextErrors.contact) {
      setErrors(nextErrors);
      return;
    }

    // `form` is shaped as { name, contact, suburb, timeline } — the next
    // step POSTs this exact object to an API.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <span className={styles.checkmark}>
          <CheckIcon className={styles.checkIcon} />
        </span>
        <h3 className={styles.successTitle}>Request received.</h3>
        <p className={styles.successText}>
          Thanks — I&rsquo;ll be in touch within 24 hours with your
          valuation.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
        />
        {errors.name && (
          <p className={styles.error}>Please enter your name.</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact" className={styles.label}>
          Phone or email
        </label>
        <input
          id="contact"
          type="text"
          value={form.contact}
          onChange={(event) => updateField("contact", event.target.value)}
          className={`${styles.input} ${
            errors.contact ? styles.inputError : ""
          }`}
        />
        {errors.contact && (
          <p className={styles.error}>
            Please enter a phone number or email.
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="suburb" className={styles.label}>
          Property address / suburb
        </label>
        <input
          id="suburb"
          type="text"
          value={form.suburb}
          onChange={(event) => updateField("suburb", event.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="timeline" className={styles.label}>
          When are you thinking of selling?
        </label>
        <select
          id="timeline"
          value={form.timeline}
          onChange={(event) => updateField("timeline", event.target.value)}
          className={styles.select}
        >
          <option>Just curious</option>
          <option>Within 3 months</option>
          <option>3–6 months</option>
          <option>Already ready to list</option>
        </select>
      </div>

      <button type="submit" className={`btn btn-gold ${styles.submit}`}>
        Request my free valuation →
      </button>
    </form>
  );
}
