import { useState, type FormEvent } from "react";
import { trackWhop } from "@/lib/pixel";
import { Icon } from "@/components/Icons";

const blank = { name: "", email: "", phone: "", address: "", service: "Roof inspection", details: "", zip: "", website: "" };

export function EstimateForm() {
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState<{ state: "idle" | "sending" | "success" | "error"; message?: string }>({ state: "idle" });
  const set = (key: keyof typeof blank, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.website) return; // honeypot: quietly ignore bots
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pageUrl: window.location.href }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn't send your request. Please call us instead.");
      trackWhop("estimate_requested", { service: form.service, value: 0, currency: "USD", lead_id: result.leadId });
      setStatus({ state: "success", message: "Estimate request received. Our team will follow up shortly." });
      setForm(blank);
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <form className="estimate-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Full name<input required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jordan Taylor" maxLength={120} /></label>
        <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" maxLength={180} /></label>
        <label>Phone number<input required type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(303) 555-0123" maxLength={40} /></label>
        <label>ZIP code<input required inputMode="numeric" autoComplete="postal-code" value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="80202" maxLength={12} /></label>
        <label className="span-2">Property address<input required autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address, city" maxLength={240} /></label>
        <label className="span-2">What can we help with?
          <select value={form.service} onChange={(e) => set("service", e.target.value)}>
            <option>Roof inspection</option><option>Roof repair / leak</option><option>Roof replacement</option><option>Storm damage</option><option>Not sure yet</option>
          </select>
        </label>
        <label className="span-2">Anything we should know? <span className="optional">Optional</span><textarea rows={3} value={form.details} onChange={(e) => set("details", e.target.value)} placeholder="A leak near the chimney, missing shingles after a storm…" maxLength={2000} /></label>
        <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></label></div>
      </div>
      <button className="button button-dark form-submit" type="submit" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending request…" : "Request my estimate"}<Icon name="arrow" size={18} />
      </button>
      <p className={`form-status ${status.state}`} role="status">{status.message || "No pressure. Your details are used to respond to this roofing request."}</p>
    </form>
  );
}
