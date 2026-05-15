import type { CalculatorMeta } from "@struct-flow/shared";

export const meta: CalculatorMeta = {
  title: "콘크리트 물량 (Slab/Wall)",
  description: "폭 × 길이 × 두께로 단순 콘크리트 물량과 거푸집 면적을 산정합니다.",
  assumptions: [
    "단순 직사각형 면 형상",
    "단면 손실 없음 (개구부 미반영)",
    "표면거푸집은 둘레 × 두께로 계산",
  ],
  cautions: [
    "이 값은 사전 검토용 추정치이며 시공 손실율과 개구부 보정을 별도 반영해야 합니다.",
    "정식 물량 산출은 구조도면/시방서를 기준으로 합니다.",
  ],
};
