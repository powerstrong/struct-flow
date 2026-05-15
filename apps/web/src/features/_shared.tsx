// Shared form/result primitives used by every calculator feature.
// Adding a calculator: import these instead of redefining locally.

import type { InputHTMLAttributes, ReactNode } from "react";

export function NumField({
  label,
  ...rest
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        type="number"
        step="any"
        className="mt-1 w-full border border-gray-300 rounded px-2 py-1"
        {...rest}
      />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & InputHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <select
        className="mt-1 w-full border border-gray-300 rounded px-2 py-1"
        {...(rest as object)}
      >
        {children}
      </select>
    </label>
  );
}

export function SubmitBtn({ submitting }: { submitting?: boolean }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full bg-accent text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
    >
      {submitting ? "계산 중…" : "계산"}
    </button>
  );
}

export function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1">
      <dt className="text-gray-600">{k}</dt>
      <dd className="font-mono">{v}</dd>
    </div>
  );
}
