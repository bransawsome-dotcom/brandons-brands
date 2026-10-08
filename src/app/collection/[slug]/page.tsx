"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteCollectionItem, getWatchByIdData, updateWatchData } from "@/lib/storage";
import { provenanceLabels, type Watch } from "@/lib/localData";
import ProvenanceFields, { emptyProvenance, provenanceFrom, type Provenance } from "@/components/ProvenanceFields";
import { useRequireAuth } from "@/components/AuthProvider";
import WatchValuePanel from "@/components/WatchValuePanel";
import { lookupWatchDetails } from "@/lib/watchAiClient";
import { applyLookup } from "@/lib/watchBuild";

export default function WatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.slug as string | undefined;
  const { user, guestMode, loading } = useRequireAuth();
  const userId = user?.id ?? null;
  const canAutoFill = Boolean(user) && !guestMode;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const [watch, setWatch] = useState<Watch | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Watch>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [provenance, setProvenance] = useState<Provenance>(emptyProvenance);

  useEffect(() => {
    if (!id || loading) return;

    getWatchByIdData(id, userId).then((w) => {
      setWatch(w ?? null);
      setForm(w ?? {});
      setPreview(w?.image_url ?? "");
      setProvenance(provenanceFrom(w ?? {}));
    });
  }, [id, loading, userId]);

  if (!id) return <div className="p-6 text-sm">Invalid watch.</div>;
  if (!watch) return <div className="p-6 text-sm">Watch not found.</div>;

  const handleDelete = async () => {
    await deleteCollectionItem(watch.id, userId);
    router.push("/collection");
  };

  const handleEditToggle = () => {
    setProvenance(provenanceFrom(watch));
    setEditing((v) => !v);
  };

  // Refreshes today's retail price and market value. Retail at purchase stays locked.
  const handleRefreshValue = async () => {
    setRefreshing(true);
    setRefreshMessage(null);
    try {
      const lookup = await lookupWatchDetails({
        brand: watch.brand,
        model: watch.model,
        reference_number: watch.reference_number,
        purchase_date: watch.purchase_date || undefined,
      });
      const updated = applyLookup(watch, lookup);
      await updateWatchData(updated, userId);
      setWatch(updated);
      setRefreshMessage("Prices updated.");
    } catch (err) {
      setRefreshMessage(err instanceof Error ? err.message : "Couldn't refresh prices.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((cur) => ({ ...cur, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPreview(file ? URL.createObjectURL(file) : watch?.image_url ?? "");
  };

  const uploadImage = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Unable to read image file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrl = photoFile
      ? await uploadImage(photoFile)
      : (form.image_url as string) || watch.image_url;

    const updated: Watch = {
      ...watch,
      id: watch.id,
      slug: watch.slug,
      image_url: imageUrl,
      brand: (form.brand as string) || watch.brand,
      model: (form.model as string) || watch.model,
      reference_number: (form.reference_number as string) || watch.reference_number,
      condition: (form.condition as string) || watch.condition,
      nickname: (form.nickname as string) || watch.nickname,
      purchase_date: (form.purchase_date as string) || watch.purchase_date,
      purchase_price: (form.purchase_price as string) || watch.purchase_price,
      estimated_value: (form.estimated_value as string) || watch.estimated_value,
      notes: (form.notes as string) || watch.notes,
      has_box: provenance.has_box,
      has_papers: provenance.has_papers,
      authenticated: provenance.authenticated,
      authenticated_by: provenance.authenticated ? provenance.authenticated_by.trim() || null : null,
    };

    await updateWatchData(updated, userId);
    setWatch(updated);
    setEditing(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 w-full overflow-hidden rounded-lg bg-slate-950/90">
            {watch.image_url ? (
              <img src={watch.image_url} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} alt={`${watch.brand} ${watch.model}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No image</div>
            )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{watch.brand}</p>
            <h1 className="mt-2 text-4xl font-bold text-white">{watch.model}</h1>
            {watch.reference_number ? <p className="mt-2 text-sm text-slate-300">Reference: <span className="font-semibold text-white">{watch.reference_number}</span></p> : null}

            {!editing ? (
              <>
                <p className="mt-4 text-sm text-slate-300">{watch.notes || "No notes."}</p>
                {watch.condition ? (
                  <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-white">Condition:</span> {watch.condition}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {provenanceLabels(watch).length ? (
                    provenanceLabels(watch).map((label) => (
                      <span key={label} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        ✓ {label}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">No box or papers recorded</span>
                  )}
                </div>
                <div className="mt-6">
                  <WatchValuePanel watch={watch} compact />
                </div>
                {!watch.purchase_price ? (
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="mt-3 text-sm font-semibold text-[#D9A43A] hover:text-[#e1b54a]"
                  >
                    + Add what you paid
                  </button>
                ) : null}
                {canAutoFill ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRefreshValue}
                      disabled={refreshing}
                      className="rounded-full border border-[#D9A43A]/50 bg-[#D9A43A]/10 px-5 py-2 text-sm font-semibold text-[#D9A43A] transition hover:bg-[#D9A43A]/20 disabled:opacity-60"
                    >
                      {refreshing ? "Checking prices…" : watch.value_updated_at ? "Refresh value" : "Auto-fill details & prices"}
                    </button>
                    {refreshMessage ? <span className="text-sm text-slate-300">{refreshMessage}</span> : null}
                  </div>
                ) : null}
                <div className="mt-6 flex gap-3">
                  <button onClick={handleEditToggle} className="rounded-full bg-[#D9A43A] px-5 py-3 text-sm font-semibold">Edit</button>
                  <button onClick={handleDelete} className="rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white">Delete</button>
                  <button onClick={() => router.push('/collection')} className="rounded-full px-5 py-3 text-sm font-semibold bg-white/5 text-white">Back</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="mt-4 grid gap-4">
                <label className="text-sm text-slate-300">
                  Brand
                  <input name="brand" value={form.brand as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Model
                  <input name="model" value={form.model as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Reference Number
                  <input name="reference_number" value={form.reference_number as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full cursor-pointer rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Purchase Price (what you paid)
                  <input name="purchase_price" inputMode="decimal" value={form.purchase_price as string || ""} onChange={handleChange} placeholder="e.g. 10500" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Estimated Value
                  <input name="estimated_value" value={form.estimated_value as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Purchase Date
                  <input type="date" name="purchase_date" value={form.purchase_date as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Condition
                  <input name="condition" value={form.condition as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <ProvenanceFields value={provenance} onChange={setProvenance} />
                <label className="text-sm text-slate-300">
                  Photo URL
                  <input name="image_url" value={form.image_url as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" />
                </label>
                <label className="text-sm text-slate-300">
                  Notes
                  <textarea name="notes" value={form.notes as string || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/90 px-3 py-2 text-white" rows={4} />
                </label>
                <div className="flex gap-3">
                  <button type="submit" className="rounded-full bg-[#D9A43A] px-5 py-3 text-sm font-semibold">Save</button>
                  <button type="button" onClick={handleEditToggle} className="rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
        {!editing && (watch.details?.summary || watch.details?.movement || watch.details?.sources?.length) ? (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-blue-300">Details &amp; prices</p>
            <WatchValuePanel watch={watch} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
