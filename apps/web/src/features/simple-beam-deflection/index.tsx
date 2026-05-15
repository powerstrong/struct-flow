import { useForm, useWatch, type Control } from "react-hook-form";
import type { CalculatorFeature, InputFormProps, ResultPanelProps } from "../registry";

interface Input {
  spanM: number;
  eiKNm2: number;
  loadCase: "udl" | "point-mid";
  udlKNPerM?: number;
  pointKN?: number;
}

interface Result {
  deflectionMm: number;
  maxMomentKNm: number;
  spanOverDeflection: number;
  withinL360: boolean;
}

const DEFAULT: Input = { spanM: 6, eiKNm2: 10_000, loadCase: "udl", udlKNPerM: 10 };

function InputForm({ initial, onSubmit, submitting }: InputFormProps<Input>) {
  const { register, handleSubmit, control } = useForm<Input>({ defaultValues: { ...DEFAULT, ...initial } });
  const loadCase = useWatch({ control: control as Control<Input>, name: "loadCase" });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <NumField label="경간 L (m)" {...register("spanM", { valueAsNumber: true, required: true, min: 0.1 })} />
      <NumField label="EI (kN·m²)" {...register("eiKNm2", { valueAsNumber: true, required: true, min: 1 })} />
      <label className="block text-sm">
        <span className="text-gray-700">하중 케이스</span>
        <select className="mt-1 w-full border border-gray-300 rounded px-2 py-1" {...register("loadCase")}>
          <option value="udl">등분포 하중 (UDL)</option>
          <option value="point-mid">중앙 집중하중</option>
        </select>
      </label>
      {loadCase === "udl" ? (
        <NumField label="w (kN/m)" {...register("udlKNPerM", { valueAsNumber: true, required: true, min: 0 })} />
      ) : (
        <NumField label="P (kN)" {...register("pointKN", { valueAsNumber: true, required: true, min: 0 })} />
      )}
      <SubmitBtn submitting={submitting} />
    </form>
  );
}

function ResultPanel({ result }: ResultPanelProps<Result>) {
  return (
    <dl className="text-sm space-y-1">
      <Row k="δmax (처짐)" v={`${result.deflectionMm.toFixed(2)} mm`} />
      <Row k="Mmax (최대 모멘트)" v={`${result.maxMomentKNm.toFixed(1)} kN·m`} />
      <Row k="L/δ" v={`L/${Math.round(result.spanOverDeflection)}`} />
      <Row
        k="L/360 사용성"
        v={result.withinL360 ? "✅ 만족" : "❌ 초과"}
      />
    </dl>
  );
}

export const simpleBeamDeflectionFeature: CalculatorFeature<Input, Result> = {
  id: "simple-beam-deflection",
  title: "단순보 처짐",
  tier: "pro",
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
