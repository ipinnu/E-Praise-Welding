export type GalleryOrientation = "portrait" | "landscape";

export type GalleryCategory =
  | "Fabrication"
  | "Sculpture"
  | "Structural"
  | "Ornamental";

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_path: string;
  category: GalleryCategory | string;
  size: string;
  orientation: GalleryOrientation;
  order_index: number;
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Fabrication",
  "Sculpture",
  "Structural",
  "Ornamental",
];

export const GALLERY_ORIENTATIONS: {
  value: GalleryOrientation;
  label: string;
  hint: string;
}[] = [
  {
    value: "portrait",
    label: "Vertical",
    hint: "Taller card in the gallery",
  },
  {
    value: "landscape",
    label: "Horizontal",
    hint: "Wide card spanning two columns",
  },
];

export function getGalleryImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `/assets/${encodeURIComponent(imagePath)}`;
}

export function getGalleryLayoutClasses(
  orientation: GalleryOrientation = "portrait",
): string {
  if (orientation === "landscape") {
    return "md:col-span-2 aspect-[16/10]";
  }
  return "aspect-[3/4]";
}

export function getGalleryStoragePath(imagePath: string): string | null {
  const marker = "/gallery-images/";
  const index = imagePath.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(imagePath.slice(index + marker.length));
}
