// Shrink a phone photo to a small JPEG data URL (about 100–250 KB) in the browser before saving it.
export async function shrinkPhoto(file: File, max = 1280): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't a photo. Try a JPEG or PNG.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That photo couldn't be opened. Try a JPEG or PNG."));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const q of [0.82, 0.7, 0.58, 0.45]) {
      const data = canvas.toDataURL("image/jpeg", q);
      if (data.length < 650_000) return data;
    }
    throw new Error("That photo is too large. Try a smaller one.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
