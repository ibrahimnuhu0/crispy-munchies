"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (status === currentStatus) return;
    setSaving(true);

    await fetch("/api/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);

    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-cream/15 bg-roast px-3 py-1.5 font-mono text-xs text-cream focus:border-gold focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="rounded-full bg-gold px-3 py-1.5 font-mono text-xs font-semibold text-roast transition hover:brightness-110 disabled:opacity-40"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Update"}
      </button>
    </div>
  );
}