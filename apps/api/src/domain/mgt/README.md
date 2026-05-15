# domain/mgt (Phase 2)

이 디렉토리는 **MIDAS Gen `.mgt` command 텍스트 빌더**가 들어갈 자리다.

MVP에서는 **빌더를 구현하지 않는다.** 구조 전문가 리뷰 채널이 확보된 뒤 Phase 2에서 다음 모듈로 분해해 채운다:

- `MgtBuilder.ts` — 빌더 패턴 진입점
- `units.ts` / `nodes.ts` / `elements.ts` / `loads.ts` / `sections.ts` — 섹션별 모듈

**금지사항 (Phase 2에서도):**
- 계산기 폴더(`apps/api/src/calculators/<slug>/`) 안에서 `\nNODE` 같은 MGT 문자열 직접 작성 금지. 모든 MGT 직렬화는 이 디렉토리에서 한다 (AGENTS.md 규칙 #3).
- 계산기 인터페이스의 `toMgt?` 필드는 MVP에서 사용하지 않는다.
