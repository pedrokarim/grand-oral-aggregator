import { notFound } from "next/navigation";
import { resolveCurrentRole } from "@/lib/roles";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const role = await resolveCurrentRole();
  if (!role.isSuperAdmin) notFound();
  return <SettingsClient />;
}
