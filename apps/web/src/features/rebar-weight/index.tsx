import { useForm } from "react-hook-form";
import type { CalculatorFeature, InputFormProps, ResultPanelProps } from "../registry";

const GRADES = ["D10", "D13", "D16", "D19", "D22", "D25", "D29"] as const;
type Grade = (typeof GRADES)[number];

interface Input {
  grade: Grade;
  lengthM: number;
  count: number;
}

interface Result {
  unitWeightKgPerM: number;
  perBarWeightKg: number;
  totalWeightKg: number;
  totalLengthM: number;
}

const DEFAULT: Input = { grade: "D16", lengthM: 6, count: 100 };

function InputForm({ initial, onSubmit, submitting }: InputFormProps<Input>) {
  const { register, handleSubmit } = useForm<Input>({ defaultValues: { ...DEFAULT, ...initial } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <label className="block text-sm">
        <span className="text-gray-700">호칭</span>
        <select className="mt-1 w-full border border-gray-300 rounded px-2 py-1" {...register("grade")}>
          {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </label>
      <NumField label="길이 (m)" {...register("lengthM", { valueAsNumber: true, required: true, min: 0.1 })} />
      <NumField label="본수" {...register("count", { valueAsNumber: true, required: true, min: 1 })} />
      <SubmitBtn submitting={submitting} />
    </form>
  );
}

function ResultPanel({ result }: ResultPanelProps<Result>) {
  return (
    <dl className="text-sm space-y-1">
      <Row k="단위중량" v={`${result.unitWeightKgPerM.toFixed(3)} kg/m`} />
      <Row k="1본 중량" v={`${result.perBarWeightKg.toFixed(2)} kg`} />
      <Row k="총 길이" v={`${result.totalLengthM.toFixed(1)} m`} />
      <Row k="총 중량" v={`${result.totalWeightKg.toFixed(1)} kg`} />
    </dl>
  );
}

export const rebarWeightFeature: CalculatorFeature<Input, Result> = {
  id: "rebar-weight",
  title: "철근 중량",
  defaultInput: DEFAULT,
  InputForm,
  ResultPanel,
};

function NumField({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input type="number" step="any" className="mt-1 w-full border border-gray-300 rounded px-2 py-1" {...rest} />
    </label>
  );
}

function SubmitBtn({ submitting }: { submitting?: boolean }) {
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1">
      <dt className="text-gray-600">{k}</dt>
      <dd className="font-mono">{v}</dd>
    </div>
  );
}
