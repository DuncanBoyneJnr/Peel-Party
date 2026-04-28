import { getPostageSettings } from "@/lib/server-data";
import PostageForm from "./PostageForm";

export const dynamic = "force-dynamic";

export default async function AdminPostagePage() {
  const settings = await getPostageSettings();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Postage Setup</h1>
        <p className="text-[#6b7280] mt-1">Configure the postage rates shown and charged at checkout.</p>
      </div>
      <PostageForm initialSettings={settings} />
    </div>
  );
}
