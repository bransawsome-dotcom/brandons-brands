"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { loadWishlistData, saveWishlistData } from "@/lib/storage";
import { useRequireAuth } from "@/components/AuthProvider";
import { type WishlistItem } from "@/lib/localData";

const initialForm = {
  brand: "",
  model: "",
  reference_number: "",
  target_price: "",
  current_market_price: "",
  priority: "Medium",
  notes: "",
  purchase_link: "",
};

const priorityOptions = ["High", "Medium", "Low"] as const;

export default function WishlistPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const userId = user?.id ?? null;
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;

    loadWishlistData(userId).then((saved) => {
      setWishlist(saved);
      setLoading(false);
    });
  }, [authLoading, userId]);

  const filteredWishlist = useMemo(() => {
    const query = search.trim().toLowerCase();
    return wishlist
      .filter((item) => {
        if (priorityFilter && item.priority !== priorityFilter) return false;
        if (!query) return true;
        return [
          item.brand,
          item.model,
          item.notes || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const priorityRank = { High: 0, Medium: 1, Low: 2 } as const;
        if (priorityRank[a.priority as keyof typeof priorityRank] !== priorityRank[b.priority as keyof typeof priorityRank]) {
          return priorityRank[a.priority as keyof typeof priorityRank] - priorityRank[b.priority as keyof typeof priorityRank];
        }
        return Number(b.id) - Number(a.id);
      });
  }, [search, priorityFilter, wishlist]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.brand.trim() || !form.model.trim()) {
      setMessage("Brand and model are required.");
      return;
    }

    const newItem: WishlistItem = {
      id: editingId ?? `${Date.now()}`,
      brand: form.brand.trim(),
      model: form.model.trim(),
      reference_number: form.reference_number.trim(),
      target_price: form.target_price,
      current_market_price: form.current_market_price,
      notes: form.notes.trim(),
      priority: form.priority,
      purchase_link: form.purchase_link.trim(),
    };

    const updated = editingId
      ? wishlist.map((item) => (item.id === editingId ? newItem : item))
      : [newItem, ...wishlist];

    setWishlist(updated);
    await saveWishlistData(userId, updated);
    setForm(initialForm);
    setEditingId(null);
    setMessage(editingId ? "Wishlist item saved." : "Wishlist item added.");
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Delete this wishlist item?");
    if (!shouldDelete) return;

    const next = wishlist.filter((item) => item.id !== id);
    setWishlist(next);
    await saveWishlistData(userId, next);
    setMessage("Wishlist item deleted.");
  };

  const handleEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setForm({
      brand: item.brand,
      model: item.model,
      reference_number: item.reference_number || "",
      target_price: item.target_price || "",
      current_market_price: item.current_market_price || "",
      priority: item.priority,
      notes: item.notes || "",
      purchase_link: item.purchase_link || "",
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Wishlist</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Luxury watch wishlist.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Capture your future acquisitions with rich details, smart priority tracking, and elegant wishlist cards.
            </p>
          </div>
          {/* local/demo indicator removed for production readiness */}
        </div>

        <form id="add-wishlist" onSubmit={handleSubmit} className="grid gap-6 rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
              >
                    {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Estimated Price
              <input
                name="target_price"
                value={form.target_price}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="42000"
              />
            </label>
          </div>

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

          {message ? (
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a]"
          >
            Add Wishlist Item
          </button>
        </form>
      </div>

      <section className="mt-12">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Wishlist status</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Your future watch ambitions.</h2>
            <p className="mt-2 text-sm text-slate-400">Search, filter, and manage your premium wishlist with luxury polish.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search wishlist"
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
            />
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300">Loading wishlist…</div>
        ) : !wishlist.length ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            <div className="text-4xl">⭐</div>
            <h3 className="mt-4 text-lg font-semibold text-white">Your wishlist is empty.</h3>
            <p className="mt-2 text-sm text-slate-300">Save watches you'd like to own in the future.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("add-wishlist");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black"
              >
                <span>➕</span>
                <span>Add Your First Wishlist Item</span>
              </button>
            </div>
          </div>
        ) : filteredWishlist.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredWishlist.map((item) => {
              const estimatedPrice = item.target_price || "";
              return (
                <article key={item.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-blue-300">{item.priority} Priority</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{item.brand} {item.model}</h3>
                    </div>
                    <div className="rounded-full border border-[#D9A43A]/20 bg-[#D9A43A]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#D9A43A]">
                      Wishlist
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span>Estimated</span>
                      <span className="font-semibold text-white">{estimatedPrice ? `$${estimatedPrice}` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>Priority</span>
                      <span className="font-semibold text-white">{item.priority}</span>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-300">{item.notes || "No notes added yet."}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-3xl border border-[#D9A43A]/20 bg-[#D9A43A]/10 px-4 py-3 text-sm font-semibold text-[#D9A43A] transition hover:bg-[#D9A43A]/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-3xl border border-rose-500/80 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            No wishlist items matched your search or filter. Adjust the search or priority to find a watch.
          </div>
        )}
      </section>
    </div>
  );
}
