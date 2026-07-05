"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatZAR } from "@/lib/format";
import type { CMA, SellerLeadOption } from "@/lib/queries";
import styles from "./CMATool.module.css";

const FARMING_SUBURBS = [
  "Barbeque Downs",
  "Blue Hills",
  "Carlswald",
  "Noordwyk",
  "Halfway Gardens",
  "Vorna Valley",
  "Summerset",
  "Glen Austin",
  "Beaulieu",
  "Saddlebrook Estate",
  "Bridle Park",
  "Glenferness",
];

interface CompRow {
  address: string;
  suburb: string;
  sold_price: string;
  beds: string;
  baths: string;
  sold_date: string;
  notes: string;
}

const emptyComp: CompRow = {
  address: "",
  suburb: "",
  sold_price: "",
  beds: "",
  baths: "",
  sold_date: "",
  notes: "",
};

interface ResultState {
  low: number | null;
  recommended: number | null;
  high: number | null;
  rationale: string;
  marketing_note: string | null;
}

export function CMATool({
  cmas,
  sellerLeads,
}: {
  cmas: CMA[];
  sellerLeads: SellerLeadOption[];
}) {
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState(FARMING_SUBURBS[0]);
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [garages, setGarages] = useState("");
  const [erfSize, setErfSize] = useState("");
  const [condition, setCondition] = useState("average");
  const [notes, setNotes] = useState("");
  const [leadId, setLeadId] = useState("");

  const [comps, setComps] = useState<CompRow[]>([
    { ...emptyComp },
    { ...emptyComp },
    { ...emptyComp },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  function updateComp(index: number, field: keyof CompRow, value: string) {
    setComps((prev) =>
      prev.map((comp, i) => (i === index ? { ...comp, [field]: value } : comp))
    );
  }

  function addComp() {
    setComps((prev) => [...prev, { ...emptyComp }]);
  }

  function removeComp(index: number) {
    setComps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!address.trim()) {
      setError("Please enter the subject property's address.");
      return;
    }

    const cleanedComps = comps
      .filter((comp) => comp.address.trim() || comp.sold_price.trim())
      .map((comp) => ({
        address: comp.address.trim(),
        suburb: comp.suburb.trim(),
        sold_price: Number(comp.sold_price) || 0,
        beds: comp.beds ? Number(comp.beds) : null,
        baths: comp.baths ? Number(comp.baths) : null,
        sold_date: comp.sold_date || null,
        notes: comp.notes.trim() || null,
      }));

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/cma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: {
            address: address.trim(),
            suburb,
            beds: beds ? Number(beds) : null,
            baths: baths ? Number(baths) : null,
            garages: garages ? Number(garages) : null,
            erf_size: erfSize ? Number(erfSize) : null,
            condition,
            notes: notes.trim() || null,
          },
          comps: cleanedComps,
          leadId: leadId || null,
        }),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseBody?.error || "Failed to generate the CMA.");
      }

      setResult(responseBody.cma.result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.heading}>CMA Generator</h1>
        <p className={styles.subtitle}>
          Enter the subject property and a few comparable sales — Claude
          writes the valuation.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Subject property</h2>
          <div className={styles.row2}>
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
            <div className={styles.field}>
              <label className={styles.label} htmlFor="suburb">
                Suburb
              </label>
              <select
                id="suburb"
                className={styles.select}
                value={suburb}
                onChange={(event) => setSuburb(event.target.value)}
              >
                {FARMING_SUBURBS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row4}>
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
            <div className={styles.field}>
              <label className={styles.label} htmlFor="erfSize">
                Erf size (m²)
              </label>
              <input
                id="erfSize"
                type="number"
                className={styles.input}
                value={erfSize}
                onChange={(event) => setErfSize(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="condition">
                Condition
              </label>
              <select
                id="condition"
                className={styles.select}
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
              >
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs_work">Needs work</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="leadId">
                Link to a seller lead (optional)
              </label>
              <select
                id="leadId"
                className={styles.select}
                value={leadId}
                onChange={(event) => setLeadId(event.target.value)}
              >
                <option value="">None</option>
                {sellerLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name || "Unnamed"}
                    {lead.suburb ? ` — ${lead.suburb}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.compsHeader}>
            <h2 className={styles.sectionTitle}>Comparable sales</h2>
            <button type="button" className={styles.addButton} onClick={addComp}>
              + Add comp
            </button>
          </div>
          <p className={styles.compsNote}>
            Enter sold prices you&rsquo;ve gathered yourself (your own deals,
            Property24 sold data, area knowledge). Automated comps can be
            added later via a licensed data source.
          </p>

          {comps.map((comp, index) => (
            <div key={index} className={styles.compRow}>
              <input
                placeholder="Address"
                className={styles.input}
                value={comp.address}
                onChange={(event) => updateComp(index, "address", event.target.value)}
              />
              <input
                placeholder="Suburb"
                className={styles.input}
                value={comp.suburb}
                onChange={(event) => updateComp(index, "suburb", event.target.value)}
              />
              <input
                placeholder="Sold price"
                type="number"
                className={styles.input}
                value={comp.sold_price}
                onChange={(event) => updateComp(index, "sold_price", event.target.value)}
              />
              <input
                placeholder="Beds"
                type="number"
                className={styles.inputSmall}
                value={comp.beds}
                onChange={(event) => updateComp(index, "beds", event.target.value)}
              />
              <input
                placeholder="Baths"
                type="number"
                className={styles.inputSmall}
                value={comp.baths}
                onChange={(event) => updateComp(index, "baths", event.target.value)}
              />
              <input
                placeholder="Sold date"
                type="date"
                className={styles.input}
                value={comp.sold_date}
                onChange={(event) => updateComp(index, "sold_date", event.target.value)}
              />
              <input
                placeholder="Notes"
                className={styles.input}
                value={comp.notes}
                onChange={(event) => updateComp(index, "notes", event.target.value)}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeComp(index)}
                aria-label="Remove comp"
              >
                ✕
              </button>
            </div>
          ))}
        </section>

        <button
          type="submit"
          className={`btn btn-gold ${styles.submit}`}
          disabled={submitting}
        >
          {submitting ? "Generating…" : "Generate valuation"}
        </button>
      </form>

      {result && (
        <section className={styles.resultCard}>
          <p className={styles.resultLabel}>Recommended price</p>
          <p className={styles.resultPrice}>
            {result.recommended != null ? formatZAR(result.recommended) : "—"}
          </p>
          {result.low != null && result.high != null && (
            <p className={styles.resultRange}>
              Range: {formatZAR(result.low)} – {formatZAR(result.high)}
            </p>
          )}
          <p className={styles.resultSubheading}>Rationale</p>
          <p className={styles.resultText}>{result.rationale}</p>
          {result.marketing_note && (
            <>
              <p className={styles.resultSubheading}>Marketing note</p>
              <p className={styles.resultText}>{result.marketing_note}</p>
            </>
          )}
        </section>
      )}

      <section className={styles.history}>
        <h2 className={styles.sectionTitle}>Past CMAs</h2>
        {cmas.length === 0 ? (
          <p className={styles.empty}>No CMAs generated yet.</p>
        ) : (
          <div className={styles.historyList}>
            {cmas.map((cma) => (
              <div key={cma.id} className={styles.historyRow}>
                <span className={styles.historyAddress}>
                  {cma.subject.address}
                </span>
                <span className={styles.historyPrice}>
                  {cma.result?.recommended != null
                    ? formatZAR(cma.result.recommended)
                    : "—"}
                </span>
                <span className={styles.historyDate}>
                  {new Date(cma.created_at).toLocaleDateString("en-ZA")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
