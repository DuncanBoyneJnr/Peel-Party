export const dynamic = "force-dynamic";

import { getCostSettings } from "@/lib/server-data";
import MaterialsAdmin from "./MaterialsAdmin";

export default async function MaterialsPage() {
  const costSettings = await getCostSettings();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Materials</h1>
        <p className="text-[#6b7280] mt-1">
          Define the raw materials used in production. Assign them to products in the Product editor.
        </p>
      </div>
      <MaterialsAdmin initialMaterials={costSettings.materials} />
    </div>
  );
}
