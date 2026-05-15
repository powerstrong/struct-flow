import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

interface FormValues {
  email: string;
  password: string;
  displayName?: string;
}

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await signup(values.email, values.password, values.displayName || undefined);
      navigate("/");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "회원가입 실패");
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-ink mb-6">회원가입</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="이메일" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            {...register("email", { required: "이메일을 입력하세요" })}
          />
        </Field>
        <Field label="비밀번호 (최소 8자)" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded px-3 py-2"
            {...register("password", { required: "비밀번호를 입력하세요", minLength: { value: 8, message: "최소 8자" } })}
          />
        </Field>
        <Field label="표시 이름 (선택)" error={errors.displayName?.message}>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            {...register("displayName", { maxLength: { value: 60, message: "60자 이하" } })}
          />
        </Field>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "가입 중…" : "회원가입"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        이미 가입하셨나요? <Link to="/login" className="text-accent hover:underline">로그인</Link>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
