import { Link } from "react-router-dom";
import { featureList } from "../features/registry";

export function Home() {
  const tools = featureList();
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-ink mb-2">Struct Flow</h1>
      <p className="text-gray-600 mb-8">
        구조설계 워크벤치. 서버에서 계산식을 실행하고 2D 도식으로 결과를 확인합니다.
      </p>

      <h2 className="text-lg font-semibold text-ink mb-3">계산기</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((t) => (
          <li key={t.id}>
            <Link
              to={`/calc/${t.id}`}
              className="block bg-white rounded border border-gray-200 p-4 hover:border-accent hover:shadow-sm transition"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-ink">{t.title}</span>
                <span className={t.tier === "pro" ? "text-xs text-accent font-bold" : "text-xs text-gray-500"}>
                  {t.tier.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">/calc/{t.id}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
