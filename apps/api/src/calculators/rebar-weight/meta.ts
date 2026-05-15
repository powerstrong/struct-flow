import type { CalculatorMeta } from "@struct-flow/shared";

export const meta: CalculatorMeta = {
  title: "철근 중량",
  description: "철근 호칭(D10..D29) 단위중량 × 길이 × 본수로 총 중량을 산정합니다.",
  assumptions: [
    "KDS 14 20 50 단위중량(kg/m) 적용",
    "이음·정착 손실 없음",
  ],
  cautions: [
    "실제 발주 중량은 손실율(통상 3~5%)을 가산해야 합니다.",
    "정밀 산출은 BBS(Bar Bending Schedule)를 기준으로 합니다.",
  ],
};
