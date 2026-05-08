# @depart-os/text-diff

인라인 태그 기반 1라운드 텍스트 diff 유틸리티. 한국어·영어 텍스트의 변경 부분을 `<del>`/`<ins>` 태그로 단일 string 에 마킹하고, React 컴포넌트로 모드별 렌더한다.

## Install

```bash
pnpm add @depart-os/text-diff
# or: npm install @depart-os/text-diff / yarn add @depart-os/text-diff
```

## 저장 포맷

```
원본:    "신호일 수 있어요"
수정후:  "신호<del>일 수 있어요</del><ins>입니다</ins>"
```

- `<del>` : 원본에 있다가 삭제
- `<ins>` : 새로 추가
- 태그 밖 : 양쪽 공통

> **1라운드 전용.** 같은 문서를 두 번 이상 누적 수정하는 워크플로우는 지원하지 않는다. 매 수정마다 항상 **최초 원본 vs 새 수정본** 으로 새 태그 string 을 만든다.

## Usage

### 빌더 측 — 수정 전송 시 태그 string 생성

```ts
import { generateTagged } from '@depart-os/text-diff'

async function submitEdit(originalContent: string, newContent: string) {
  const tagged = generateTagged(originalContent, newContent)
  // tagged === "신호<del>일 수 있어요</del><ins>입니다</ins>"
  await api.put('/captions/123', { content: tagged })
}
```

### 받는 쪽 — 모드별 렌더

```tsx
import { WordDiff } from '@depart-os/text-diff'

function ReviewPanel({ content }: { content: string }) {
  return (
    <>
      <section>
        <h3>변경사항</h3>
        <WordDiff content={content} mode="diff" />
      </section>
      <section>
        <h3>수정본</h3>
        <WordDiff content={content} mode="after" />
      </section>
      <section>
        <h3>원본</h3>
        <WordDiff content={content} mode="before" />
      </section>
    </>
  )
}
```

추가된 단어는 파란 톤(`bg-blue-100`), 삭제된 단어는 분홍 톤(`bg-rose-50`)에 취소선으로 표시된다.

### Plain text 호환

태그 없는 plain text 를 넘기면 모든 모드에서 그대로 렌더된다 (변경 표시 없음). 기존 데이터와 신규 데이터를 한 컬럼에 섞어 보관해도 안전하다.

## Tailwind v4 설정

이 패키지는 Tailwind v3/v4 클래스 문자열을 그대로 출력한다. 소비측 프로젝트의 Tailwind 가 패키지 dist 도 스캔해야 색이 입혀진다.

**Tailwind v4 (CSS-first)** — `globals.css` 에서:

```css
@import 'tailwindcss';
@source '../../node_modules/@depart-os/text-diff/dist';
```

`@source` 의 상대 경로는 그 CSS 파일의 위치 기준으로 조정한다.

**Tailwind v3** — `tailwind.config.js` 의 `content` 에 추가:

```js
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@depart-os/text-diff/dist/**/*.{js,mjs,cjs}',
  ],
}
```

## API

### `generateTagged(before: string, after: string): string`

LCS 기반 워드 단위 diff 를 계산하고 `<del>`/`<ins>` 태그로 직렬화한 단일 string 을 반환. 한글/영문/공백/구두점을 각각의 토큰으로 분리.

### `<WordDiff content mode className? />`

태그 문자열을 파싱해서 mode 별로 렌더.

| mode | 동작 |
|------|------|
| `'diff'` | `<del>` 분홍+취소선, `<ins>` 파란 강조, eq 일반 |
| `'after'` | `<del>` 제외, `<ins>` 내용만 살림 → 수정 후 평문처럼 보임 |
| `'before'` | `<ins>` 제외, `<del>` 내용만 살림 → 수정 전 평문처럼 보임 |

`className` 은 컨테이너 `<p>` 에 추가된다.

## Sanitization

`<del>`/`<ins>` 는 HTML5 표준 시맨틱 태그라 DOMPurify 등 대부분의 sanitizer 기본 whitelist 에 포함된다. 통상 별도 작업 없이 통과한다. 보수적인 환경이면 운영 적용 전 PUT → GET 라운드트립을 한 번 확인.

## License

MIT
