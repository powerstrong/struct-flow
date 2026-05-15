import { useForm } from "react-hook-form";
import type { CalculatorFeature, InputFormProps, ResultPanelProps } from "../registry";

interface Input {
  widthMm: number;
  lengthMm: number;
  thicknessMm: number;
}

interface Result {
  volumeM3: number;
  topAreaM2: number;
  edgeAreaM2: number;
}

const DEFAULT: Input = { widthMm: 6000, lengthMm: 4000, thicknessMm: 200 };

function InputForm({ initial, onSubmit, submitting }: InputFormProps<Input>) {
  const { register, handleSubmit } = useForm<Input>({ defaultValues: { ...DEFAULT, ...initial } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <NumField label="가로 (mm)" {...register("widthMm", { valueAsNumber: true, required: true, min: 1 })} />
      <NumField label="세로 (mm)" {...register("lengthMm", { valueAsNumber: true, required: true, min: 1 })} />
      <NumField label="두께 (mm)" {...register("thicknessMm", { valueAsNumber: true, required: true, min: 1 })} />
      <SubmitBtn submitting={submitting} />
    </form>
  );
}

function ResultPanel({ result }: ResultPanelProps<Result>) {
  return (
    <dl className="text-sm space-y-1">
      <Row k="V (체적)" v={`${result.volumeM3.toFixed(3)} m³`} />
      <Row k="상면적" v={`${result.topAreaM2.toFixed(2)} m²`} />
      <Row k="둘레면적" v={`${result.edgeAreaM2.toFixed(2)} m²`} />
    </dl>
  );
}

export const concreteVolumeFeature: CalculatorFeature<Input, Result> = {
  id: "concrete-volume",
  title: "콘크리트 물량",
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
