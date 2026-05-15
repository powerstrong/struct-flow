import type { CalculatorMeta } from "@struct-flow/shared";

export const meta: CalculatorMeta = {
  title: "단순보 처짐 (등분포/집중하중)",
  description: "양단 단순지지보의 등분포 또는 중앙 집중하중에 의한 최대 처짐을 산정합니다.",
  assumptions: [
    "선형 탄성, 보 단면 일정 (prismatic)",
    "전단 변형 무시 (Euler-Bernoulli)",
    "양단 핀-롤러 단순지지",
  ],
  cautions: [
    "L/360, L/240 같은 사용성 한계는 용도/구조 시방에 따라 다릅니다. 단순 참고치입니다.",
    "복합 하중·연속보·캔틸레버는 본 계산 범위가 아닙니다.",
    "정식 처짐 검토는 KDS 14 20 30 사용성 기준을 따라야 합니다.",
  ],
};
