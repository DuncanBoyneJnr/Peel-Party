import { getGallery } from "@/lib/server-data";
import GalleryAdmin from "./GalleryAdmin";

export const dynamic = "force-dynamic";

export default function AdminGalleryPage() {
  const items = getGallery();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Gallery</h1>
        <p className="text-[#6b7280] mt-1">{items.length} items · upload photos, edit labels, reorder</p>
      </div>
      <GalleryAdmin initialItems={items} />
    </div>
  );
}
