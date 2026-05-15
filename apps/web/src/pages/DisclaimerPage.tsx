export function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 prose">
      <h1 className="text-2xl font-bold text-ink mb-4">면책 사항</h1>
      <p className="text-sm text-gray-700 leading-relaxed">
        Struct Flow가 제공하는 계산 결과는 정식 구조계산서를 대체하지 않는 <strong>pre-check 용도의 추정치</strong>입니다.
        실제 구조 설계, 시공 도서 작성, 인허가 자료 등 책임이 따르는 산출에는 반드시 면허를 보유한 구조기술사의 정식
        구조계산서를 사용해야 합니다.
      </p>
      <p className="text-sm text-gray-700 leading-relaxed mt-3">
        본 서비스의 계산식은 일반적으로 알려진 교과서 수준의 공식을 기반으로 하며, 특정 프로젝트의 모든 조건
        (지반 조사, 하중 조합, 시공 조건, 부재 단부 조건 등)을 반영하지 않습니다. 사용자가 입력한 값의 적절성에
        대한 책임은 사용자에게 있으며, 본 서비스의 결과로 인해 발생한 어떠한 손해에 대해서도 운영자는 책임지지 않습니다.
      </p>
      <p className="text-sm text-gray-700 leading-relaxed mt-3">
        본 서비스는 KDS 등 국내 설계 기준의 일부 공식을 인용할 수 있으나, 기준의 정확한 적용은 각 사용자가
        해당 시점의 최신 기준을 직접 확인하여 따라야 합니다.
      </p>
    </div>
  );
}
