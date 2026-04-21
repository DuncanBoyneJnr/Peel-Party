import { getSettings } from "@/lib/server-data";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const settings = getSettings();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Settings</h1>
        <p className="text-[#6b7280] mt-1">Manage your business info, homepage content, and site text.</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
