"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteCollectionItem, getWatchBySlugData, updateWatchData } from "@/lib/storage";
import { type Watch } from "@/lib/localData";
import { useRequireAuth } from "@/components/AuthProvider";

export default function WatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;
  const { user, loading } = useRequireAuth();
  const userId = user?.id ?? null;

  const [watch, setWatch] = useState<Watch | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Watch>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!slug || loading) return;

    getWatchBySlugData(slug, userId).then((w) => {
      setWatch(w ?? null);
      setForm(w ?? {});
      setPreview(w?.image_url ?? "");
    });
  }, [slug, loading, userId]);

  if (!slug) return <div className="p-8">Invalid watch.</div>;
  if (!watch) return <div className="p-8">Watch not found.</div>;

  const handleDelete = async () => {
    await deleteCollectionItem(watch.id, userId);
    router.push("/collection");
  };

  const handleEditToggle = () => setEditing((v) => !v);

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
    };

    await updateWatchData(updated, userId);
    setWatch(updated);
    setEditing(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 w-full overflow-hidden rounded-lg bg-slate-950/90">
            {watch.image_url ? (
              <img src={watch.image_url} alt={`${watch.brand} ${watch.model}`} className="h-full w-full object-cover" />
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
                <div className="mt-6 space-y-2 text-sm text-slate-300">
                  <div><span className="font-semibold text-white">Purchase Price:</span> {watch.purchase_price ? `$${watch.purchase_price}` : "—"}</div>
                  <div><span className="font-semibold text-white">Estimated Value:</span> {watch.estimated_value ? `$${watch.estimated_value}` : "—"}</div>
                  <div><span className="font-semibold text-white">Purchase Date:</span> {watch.purchase_date || "—"}</div>
                  <div><span className="font-semibold text-white">Condition:</span> {watch.condition ?? "—"}</div>
                </div>
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
      </div>
    </div>
  );
}
