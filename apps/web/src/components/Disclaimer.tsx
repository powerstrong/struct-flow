export const DISCLAIMER_TEXT =
  "본 서비스의 계산 결과는 정식 구조계산서가 아닌 pre-check 용도입니다. 실제 설계/시공에 사용 시 면허 보유 구조기술사의 검증을 받으시기 바랍니다.";

export function Disclaimer() {
  return (
    <div className="text-xs text-amber-900 bg-amber-50 border-t border-amber-200 px-4 py-2 text-center">
      ⚠️ {DISCLAIMER_TEXT}
    </div>
  );
}
