"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { loadWishlist, saveWishlist, type WishlistItem } from "@/lib/localData";

const initialForm = {
  brand: "",
  model: "",
  notes: "",
  priority: "Medium",
  estimated_price: "",
  purchase_link: "",
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadWishlist();
    setWishlist(saved);
    setLoading(false);
  }, []);

  function fetchWishlist() {
    const saved = loadWishlist();
    setWishlist(saved);
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.brand.trim() || !form.model.trim()) {
      setMessage("Brand and model are required.");
      return;
    }

    const newItem: WishlistItem = {
      id: `${Date.now()}`,
      brand: form.brand.trim(),
      model: form.model.trim(),
      notes: form.notes.trim(),
      priority: form.priority,
      estimated_price: form.estimated_price,
      purchase_link: form.purchase_link.trim(),
    };

    const updated = [newItem, ...wishlist];
    setWishlist(updated);
    saveWishlist(updated);
    setForm(initialForm);
    setMessage("Wishlist item saved locally.");
  };

  const signInWithEmail = async () => {
    setMessage("Local mode active. No authentication required.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Wishlist</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Save your next watch ambitions.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Add watches you want, track priority, pricing, and purchase links for a polished wishlist experience.
            </p>
          </div>
          <div className="rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition">
            Local mode active
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Brand
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="Audemars Piguet"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Model
                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="Royal Oak"
                  required
                />
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Priority
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Estimated Price
                <input
                  name="estimated_price"
                  value={form.estimated_price}
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="15000"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Purchase Link
              <input
                name="purchase_link"
                value={form.purchase_link}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="https://example.com/watch"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="Why this watch is a future must-have"
              />
            </label>

            {message ? <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</div> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a] sm:w-auto"
            >
              Add Wishlist Item
            </button>
          </form>
      </div>

      <section className="mt-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Wishlist status</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Your future watch ambitions.</h2>
          </div>
          <div className="text-sm text-slate-400">{wishlist.length} item{wishlist.length === 1 ? "" : "s"}</div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300">Loading wishlist…</div>
        ) : wishlist.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {wishlist.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-blue-300">{item.priority} Priority</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{item.brand} {item.model}</h3>
                  </div>
                  {item.purchase_link ? (
                    <a
                      href={item.purchase_link}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-blue-100 transition hover:bg-blue-500/20"
                    >
                      Buy
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <p>
                    <span className="font-semibold text-white">Estimate:</span> {item.estimated_price ? `$${item.estimated_price}` : "N/A"}
                  </p>
                  <p>{item.notes || "No notes added."}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            Your wishlist is empty. Add desired pieces and track their priority as you build your collection plan.
          </div>
        )}
      </section>
    </div>
  );
}
