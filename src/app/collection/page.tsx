"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { loadCollection, saveCollection, type Watch } from "@/lib/localData";
import { useRequireAuth } from "@/components/AuthProvider";

function buildSlug(brand: string, model: string) {
  return `${brand.trim().toLowerCase()} ${model.trim().toLowerCase()}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const initialForm = {
  image_url: "",
  brand: "",
  model: "",
  nickname: "",
  purchase_date: "",
  purchase_price: "",
  estimated_value: "",
  notes: "",
};

export default function CollectionPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [search, setSearch] = useState("");
  const { user, loading: authLoading } = useRequireAuth();
  const userId = user?.id ?? null;
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [sortOption, setSortOption] = useState<"highest" | "lowest" | "newest" | "oldest" | "brand">("highest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [message, setMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    const saved = loadCollection(userId);
    setWatches(saved);
    setLoading(false);
  }, [authLoading, userId]);

  function fetchWatches() {
    const saved = loadCollection(userId);
    setWatches(saved);
  }

  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(watches.map((w) => w.brand))).filter(Boolean) as string[];
    return brands.sort();
  }, [watches]);

  const uniqueConditions = useMemo(() => {
    const conditions = Array.from(new Set(watches.map((w) => w.condition).filter(Boolean))).filter(Boolean) as string[];
    return conditions.sort();
  }, [watches]);

  const filteredWatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = watches.filter((w) => {
      if (query) {
        const hay = `${w.brand} ${w.model} ${w.nickname} ${w.reference_number ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      if (brandFilter && w.brand !== brandFilter) return false;
      if (conditionFilter && w.condition !== conditionFilter) return false;

      const val = parseFloat(w.estimated_value || "0") || 0;
      const min = parseFloat(priceMin || "0") || 0;
      const max = priceMax ? parseFloat(priceMax) : Infinity;
      if (val < min) return false;
      if (val > max) return false;

      return true;
    });

    return [...results].sort((left, right) => {
      if (sortOption === "highest") {
        return (parseFloat(right.estimated_value || "0") || 0) - (parseFloat(left.estimated_value || "0") || 0);
      }
      if (sortOption === "lowest") {
        return (parseFloat(left.estimated_value || "0") || 0) - (parseFloat(right.estimated_value || "0") || 0);
      }
      if (sortOption === "newest") {
        return new Date(right.purchase_date).getTime() - new Date(left.purchase_date).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(left.purchase_date).getTime() - new Date(right.purchase_date).getTime();
      }
      if (sortOption === "brand") {
        return left.brand.localeCompare(right.brand);
      }
      return 0;
    });
  }, [watches, search, brandFilter, conditionFilter, sortOption, priceMin, priceMax]);

  const uploadImage = async (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.brand.trim() || !form.model.trim()) {
      setMessage("Brand and model are required.");
      return;
    }

    const imageUrl = photoFile ? await uploadImage(photoFile) : form.image_url;
    const newWatch: Watch = {
      id: `${Date.now()}`,
      slug: buildSlug(form.brand, form.model),
      image_url: imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      brand: form.brand.trim(),
      model: form.model.trim(),
      nickname: form.nickname.trim(),
      purchase_date: form.purchase_date,
      purchase_price: form.purchase_price,
      estimated_value: form.estimated_value,
      notes: form.notes.trim(),
    };

    const updated = [newWatch, ...watches];
    setWatches(updated);
    saveCollection(userId, updated);
    setForm(initialForm);
    setPhotoFile(null);
    setPreview("");
    setMessage("Watch added locally.");
  };

  const signInWithEmail = async () => {
    setMessage("Local mode active. No authentication needed.");
  };

  const signOut = async () => {
    setMessage("Local mode active. No sign out required.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">My Collection</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Build a luxury watch archive.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Add new watches with photo upload, brand, model, price and notes. Switch between grid and list views for a premium management experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${view === "grid" ? "bg-blue-500 text-white" : "bg-white/5 text-blue-200 hover:bg-white/10"}`}
            >
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${view === "list" ? "bg-blue-500 text-white" : "bg-white/5 text-blue-200 hover:bg-white/10"}`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 mb-6 grid gap-4 rounded-[1.25rem] border border-white/6 bg-black/20 p-4 sm:grid-cols-4">
          <div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, model, nickname, reference..."
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none"
            />
          </div>
          <div>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none">
              <option value="">All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none">
              <option value="">All Conditions</option>
              {uniqueConditions.map((condition) => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          <div>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value as typeof sortOption)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none">
              <option value="highest">Highest Estimated Value</option>
              <option value="lowest">Lowest Estimated Value</option>
              <option value="newest">Newest Purchase Date</option>
              <option value="oldest">Oldest Purchase Date</option>
              <option value="brand">Brand A-Z</option>
            </select>
          </div>
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min $" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none" />
          <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max $" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none" />
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
                  placeholder="Rolex, Omega, Patek Philippe"
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
                  placeholder="Submariner, Speedmaster"
                  required
                />
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Nickname
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="The Night Rider"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Purchase Date
                <input
                  type="date"
                  name="purchase_date"
                  value={form.purchase_date}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                />
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Purchase Price
                <input
                  name="purchase_price"
                  value={form.purchase_price}
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="45000"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Estimated Value
                <input
                  name="estimated_value"
                  value={form.estimated_value}
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="62000"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full cursor-pointer rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Photo URL fallback
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="https://example.com/watch.jpg"
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
                placeholder="Add styling notes, provenance, or collection context"
              />
            </label>

            {preview ? (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90">
                <img src={preview} alt="Preview watch" className="h-60 w-full object-cover" />
              </div>
            ) : null}

            {message ? <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</div> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a] sm:w-auto"
            >
              Add Watch
            </button>
          </form>
      </div>

      <section className="mt-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Your luxury archive</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{view === "grid" ? "Gallery view" : "List view"}</h2>
          </div>
          <div className="text-sm text-slate-400">{filteredWatches.length} watch{filteredWatches.length === 1 ? "" : "s"}</div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300">Loading your collection…</div>
        ) : filteredWatches.length ? (
          <div className={view === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-6"}>
            {filteredWatches.map((watch) => (
              <Link key={watch.id} href={`/collection/${watch.slug}`} className="group block cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#D9A43A]/40 hover:shadow-[0_35px_80px_rgba(217,164,58,0.18)]">
                {view === "grid" ? (
                  <div className="flex flex-col">
                    <div className="h-64 w-full bg-slate-950/90 overflow-hidden">
                      {watch.image_url ? (
                        <img src={watch.image_url} alt={`${watch.brand} ${watch.model}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-sm uppercase tracking-[0.25em] text-blue-300">{watch.brand}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{watch.model}</h3>
                      {watch.reference_number ? <p className="text-sm text-slate-400">Reference: {watch.reference_number}</p> : null}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-slate-300">
                          <div><span className="font-semibold text-white">Estimated:</span> {watch.estimated_value ? `$${watch.estimated_value}` : "—"}</div>
                          <div><span className="font-semibold text-white">Condition:</span> {watch.condition ?? "—"}</div>
                        </div>
                        <div className="rounded-full bg-[#D9A43A] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_12px_30px_rgba(217,164,58,0.18)] transition group-hover:scale-[1.01]">View Details</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-72 bg-slate-950/90">
                      {watch.image_url ? (
                        <img src={watch.image_url} alt={`${watch.brand} ${watch.model}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">{watch.brand}</p>
                          <h3 className="mt-2 text-2xl font-semibold text-white">{watch.model}</h3>
                          {watch.nickname ? <p className="text-sm text-slate-400">“{watch.nickname}”</p> : null}
                        </div>
                        <span className="rounded-full bg-[#D9A43A]/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">Value</span>
                      </div>
                      <div className="mt-5 space-y-3 text-sm text-slate-300">
                        <p>
                          <span className="font-semibold text-white">Purchased:</span> {watch.purchase_date || "—"}
                        </p>
                        <p>
                          <span className="font-semibold text-white">Price:</span> {watch.purchase_price ? `$${watch.purchase_price}` : "—"}
                        </p>
                        <p>
                          <span className="font-semibold text-white">Estimated:</span> {watch.estimated_value ? `$${watch.estimated_value}` : "—"}
                        </p>
                        <p>{watch.notes || "No additional notes."}</p>
                        <div className="mt-4 rounded-full bg-[#D9A43A] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_12px_30px_rgba(217,164,58,0.18)] transition group-hover:scale-[1.01]">View Details</div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            Your collection is empty. Add a watch to begin curating your luxury archive.
          </div>
        )}

        {/* Details modal */}
        {selectedWatch ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedWatch(null)} />
            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-80 bg-slate-950/90 overflow-hidden rounded-lg">
                  {selectedWatch.image_url ? (
                    <img src={selectedWatch.image_url} alt={`${selectedWatch.brand} ${selectedWatch.model}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{selectedWatch.brand}</p>
                  <h3 className="mt-2 text-3xl font-bold text-white">{selectedWatch.model}</h3>
                  {selectedWatch.reference_number ? <p className="mt-2 text-sm text-slate-300">Reference: <span className="font-semibold text-white">{selectedWatch.reference_number}</span></p> : null}
                  <p className="mt-4 text-sm text-slate-300">{selectedWatch.notes}</p>
                  <div className="mt-6 space-y-2 text-sm text-slate-300">
                    <div><span className="font-semibold text-white">Estimated value:</span> {selectedWatch.estimated_value ? `$${selectedWatch.estimated_value}` : "—"}</div>
                    <div><span className="font-semibold text-white">Condition:</span> {selectedWatch.condition ?? "—"}</div>
                    <div><span className="font-semibold text-white">Purchased:</span> {selectedWatch.purchase_date || "—"}</div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setSelectedWatch(null)} className="rounded-full px-5 py-3 text-sm font-semibold bg-white/5 text-white">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
