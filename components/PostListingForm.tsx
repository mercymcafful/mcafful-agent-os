"use client";

import { useState, type FormEvent } from "react";
import styles from "./PostListingForm.module.css";

export function PostListingForm({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [suburb, setSuburb] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [garages, setGarages] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please give the listing a title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          suburb: suburb.trim() || null,
          address: address.trim() || null,
          price: price ? Number(price) : null,
          beds: beds ? Number(beds) : null,
          baths: baths ? Number(baths) : null,
          garages: garages ? Number(garages) : null,
          status,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to post listing.");
      }

      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="suburb">
            Suburb
          </label>
          <input
            id="suburb"
            className={styles.input}
            value={suburb}
            onChange={(event) => setSuburb(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="address">
          Address
        </label>
        <input
          id="address"
          className={styles.input}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">
            Price (ZAR)
          </label>
          <input
            id="price"
            type="number"
            className={styles.input}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className={styles.select}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="active">Active</option>
            <option value="under_offer">Under offer</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className={styles.row3}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="beds">
            Beds
          </label>
          <input
            id="beds"
            type="number"
            className={styles.input}
            value={beds}
            onChange={(event) => setBeds(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="baths">
            Baths
          </label>
          <input
            id="baths"
            type="number"
            className={styles.input}
            value={baths}
            onChange={(event) => setBaths(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="garages">
            Garages
          </label>
          <input
            id="garages"
            type="number"
            className={styles.input}
            value={garages}
            onChange={(event) => setGarages(event.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-gold" disabled={submitting}>
        {submitting ? "Posting…" : "Post listing"}
      </button>
    </form>
  );
}
