import { useForm } from "react-hook-form";
import type { CalculatorFeature, InputFormProps, ResultPanelProps } from "../registry";
import { NumField, SubmitBtn, Row } from "../_shared";

interface Input {
  lengthM: number;
  widthM: number;
  axialKN: number;
  momentKNm: number;
  qAllowKPa: number;
}

interface Result {
  areaM2: number;
  eccentricityM: number;
  withinKern: boolean;
  qMaxKPa: number;
  qMinKPa: number;
  qAvgKPa: number;
  safetyRatio: number;
  passes: boolean;
}

const DEFAULT: Input = { lengthM: 3, widthM: 2, axialKN: 600, momentKNm: 100, qAllowKPa: 200 };

function InputForm({ initial, onSubmit, submitting }: InputFormProps<Input>) {
  const { register, handleSubmit } = useForm<Input>({ defaultValues: { ...DEFAULT, ...initial } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <NumField label="L 길이 (m)" {...register("lengthM", { valueAsNumber: true, required: true, min: 0.1 })} />
      <NumField label="B 폭 (m)" {...register("widthM", { valueAsNumber: true, required: true, min: 0.1 })} />
      <NumField label="P 축력 (kN)" {...register("axialKN", { valueAsNumber: true, required: true, min: 0 })} />
      <NumField label="M 모멘트 (kN·m)" {...register("momentKNm", { valueAsNumber: true, min: 0 })} />
      <NumField label="허용 지내력 (kPa)" {...register("qAllowKPa", { valueAsNumber: true, required: true, min: 1 })} />
      <SubmitBtn submitting={submitting} />
    </form>
  );
}

function ResultPanel({ result }: ResultPanelProps<Result>) {
  return (
    <dl className="text-sm space-y-1">
      <Row k="면적 A" v={`${result.areaM2.toFixed(2)} m²`} />
      <Row k="편심 e" v={`${result.eccentricityM.toFixed(3)} m`} />
      <Row k="kern 영역" v={result.withinKern ? "내" : "외 (uplift)"} />
      <Row k="qmax" v={`${result.qMaxKPa.toFixed(1)} kPa`} />
      <Row k="qmin" v={`${result.qMinKPa.toFixed(1)} kPa`} />
      <Row k="qavg" v={`${result.qAvgKPa.toFixed(1)} kPa`} />
      <Row k="안전율 (qallow/qmax)" v={result.safetyRatio.toFixed(2)} />
      <Row k="판정" v={result.passes ? "✅ OK" : "❌ NG"} />
    </dl>
  );
}

export const footingBearingFeature: CalculatorFeature<Input, Result> = {
  id: "footing-bearing",
  title: "독립기초 접지압",
  tier: "pro",
  defaultInput: DEFAULT,
  InputForm,
  ResultPanel,
};
