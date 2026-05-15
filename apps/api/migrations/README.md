# apps/api/migrations

Cloudflare D1 마이그레이션 파일 모음. **모든 DDL은 여기에**만 둔다.

## 적용

```bash
# 로컬 (.wrangler/state/d1)
npm run -w @struct-flow/api migrate:dev

# prod
npm run -w @struct-flow/api migrate:prod
```

## 추가 규칙
- 파일명 규칙: `NNNN_subject.sql` (zero-padded 4자리).
- 한 마이그레이션 = 한 논리적 변경. 여러 테이블을 한 번에 만드는 init은 예외.
- 손으로 prod DB에 직접 SQL을 치지 말 것. 모든 변경은 이 폴더의 파일 추가 + `migrate:prod`로.
- 마이그레이션 파일은 **반드시** `apps/api/src/infra/schema.ts`의 Drizzle 스키마와 동기화.
