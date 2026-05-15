import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { features } from "../features/registry";
import type { CalculatorId, ViewModel2D } from "@struct-flow/shared";
import { isCalculatorId } from "@struct-flow/shared";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { SvgViewer } from "../components/viewer/SvgViewer";
import { DockLayout } from "../components/Layout";

interface RunResponse {
  toolSlug: CalculatorId;
  toolVersion: string;
  result: unknown;
  viewModel: ViewModel2D | null;
  recordedAt: string;
}

const META: Record<CalculatorId, { tier: "free" | "pro" }> = {
  "concrete-volume": { tier: "free" },
  "rebar-weight": { tier: "free" },
  "simple-beam-deflection": { tier: "pro" },
  "footing-bearing": { tier: "pro" },
};

export function CalculatorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { me } = useAuth();
  const [response, setResponse] = useState<RunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!slug || !isCalculatorId(slug)) {
    return <div className="p-8">알 수 없는 계산기입니다.</div>;
  }
  const feature = features[slug];
  const tier = META[slug].tier;

  async function run(input: unknown) {
    setError(null);
    setLoading(true);
    try {
      const res = await api<RunResponse>(`/api/calc/${slug}`, {
        method: "POST",
        body: JSON.stringify({ input }),
      });
      setResponse(res);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        if (err.status === 403) {
          setError("Pro 권한이 필요한 계산기입니다.");
        } else {
          setError(err.message);
        }
      } else {
        setError("계산 실패");
      }
    } finally {
      setLoading(false);
    }
  }

  const proGate =
    tier === "pro" && !me ? (
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
        Pro 계산기입니다. <Link to="/login" className="underline">로그인</Link>이 필요합니다.
      </div>
    ) : tier === "pro" && me && !me.proActive ? (
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
        Pro 권한이 필요합니다. <Link to="/pricing" className="underline">요금제</Link> 참고.
      </div>
    ) : null;

  return (
    <DockLayout
      left={
        <div className="space-y-3">
          <h2 className="font-semibold text-ink">{feature.title}</h2>
          <div className="text-xs text-gray-500">
            tier: {tier.toUpperCase()} · slug: {slug}
          </div>
          {proGate}
          <feature.InputForm onSubmit={run} submitting={loading} />
        </div>
      }
      center={
        response?.viewModel ? (
          <div className="h-full min-h-[400px]">
            <SvgViewer viewModel={response.viewModel} />
          </div>
        ) : (
          <div className="text-gray-400 text-sm h-full grid place-items-center">
            결과 시각화 영역
          </div>
        )
      }
      right={
        <div className="space-y-3">
          <h3 className="font-semibold text-ink text-sm">결과</h3>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {response && <feature.ResultPanel result={response.result} />}
          {!response && !error && <p className="text-sm text-gray-400">계산 후 결과가 표시됩니다.</p>}
        </div>
      }
      bottom={
        <CalcNav current={slug} />
      }
    />
  );
}

function CalcNav({ current }: { current: CalculatorId }) {
  return (
    <nav className="flex gap-3 text-sm">
      {(Object.keys(features) as CalculatorId[]).map((id) => (
        <Link
          key={id}
          to={`/calc/${id}`}
          className={id === current ? "font-semibold text-ink" : "text-gray-500 hover:text-ink"}
        >
          {features[id].title}
        </Link>
      ))}
    </nav>
  );
}
