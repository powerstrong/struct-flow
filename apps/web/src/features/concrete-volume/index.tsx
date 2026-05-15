import { useForm } from "react-hook-form";
import type { CalculatorFeature, InputFormProps, ResultPanelProps } from "../registry";
import { NumField, SubmitBtn, Row } from "../_shared";

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
  tier: "free",
  defaultInput: DEFAULT,
  InputForm,
  ResultPanel,
};
