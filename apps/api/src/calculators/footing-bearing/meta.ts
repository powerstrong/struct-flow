import type { CalculatorMeta } from "@struct-flow/shared";

export const meta: CalculatorMeta = {
  title: "독립기초 접지압",
  description: "축력 + 1축 모멘트를 받는 강체 직사각형 독립기초의 최대/최소 접지압을 산정하고 허용지내력과 비교합니다.",
  assumptions: [
    "강체 기초 가정 (rigid footing)",
    "1축 편심만 고려 (양축 편심 제외)",
    "지반은 선형 탄성 + tension 미저항 (e > L/6에서 uplift)",
  ],
  cautions: [
    "본 결과는 사용하중(service load) 기준 접지압 추정치입니다.",
    "허용지내력은 지반조사 보고서의 값이어야 하며, 본 계산기 입력값은 사용자 책임입니다.",
    "양축 편심·기초 자중·부력은 별도 반영이 필요합니다.",
    "정식 검토는 KDS 11 50 20 기초 설계 기준에 따라야 합니다.",
  ],
};
