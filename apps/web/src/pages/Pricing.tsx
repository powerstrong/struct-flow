export function Pricing() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-ink mb-6">요금제</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Plan
          title="Free"
          price="₩0"
          features={[
            "콘크리트 물량 계산기",
            "철근 중량 계산기",
            "이력 (로그인 시 최근 10개)",
          ]}
        />
        <Plan
          title="Pro · 1년"
          price="별도 안내"
          features={[
            "Free 전체 +",
            "단순보 처짐 계산기",
            "독립기초 접지압 계산기",
            "이메일/계좌이체 수동 전환 (MVP)",
          ]}
          highlighted
        />
      </div>
      <p className="text-xs text-gray-500 mt-6">
        MVP 단계에서는 결제 모듈을 연동하지 않습니다. Pro 전환은 운영자와 직접 입금 협의 후 수동 부여됩니다.
      </p>
    </div>
  );
}

function Plan({ title, price, features, highlighted }: { title: string; price: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`rounded border p-5 ${highlighted ? "border-accent bg-blue-50" : "border-gray-200 bg-white"}`}>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-2xl font-bold my-2">{price}</p>
      <ul className="text-sm text-gray-700 space-y-1 mt-3">
        {features.map((f) => <li key={f}>· {f}</li>)}
      </ul>
    </div>
  );
}
