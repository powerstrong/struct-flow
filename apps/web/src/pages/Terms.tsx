export function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-ink mb-4">이용 약관 (MVP 간이안)</h1>
      <ol className="text-sm text-gray-700 space-y-3 list-decimal pl-5">
        <li>본 서비스는 구조설계 pre-check 도구로 제공되며, 결과는 정식 구조계산서가 아닙니다.</li>
        <li>회원은 자신의 이메일과 비밀번호를 안전하게 관리해야 합니다.</li>
        <li>유료(Pro) 권한은 계좌 입금 확인 후 운영자가 수동으로 부여하며, 환불은 입금 후 7일 이내에만 가능합니다.</li>
        <li>운영자는 서비스의 모든 계산 결과의 정확성에 대해 별도의 보증을 하지 않으며, 사용으로 인한 손해에 대해 책임을 지지 않습니다.</li>
        <li>운영자는 사전 고지 후 서비스의 가격, 기능, 이용 조건을 변경할 수 있습니다.</li>
      </ol>
      <p className="text-xs text-gray-500 mt-6">
        본 약관은 MVP 단계의 간이안이며, 정식 출시 전 법무 검토를 거쳐 갱신됩니다.
      </p>
    </div>
  );
}
