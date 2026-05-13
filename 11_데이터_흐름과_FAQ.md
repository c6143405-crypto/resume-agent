# 11. 데이터 흐름 + 자주 헷갈리는 것

> 전체 그림을 한 번에 보고 싶을 때, 또는 *"이건 어디 만져야 하지?"* 헷갈릴 때.

---

## 데이터가 어떻게 흐르는지

```
[사용자가 챗에 글 입력 — A 타입 페이지]
              ↓
   classifyUserIntent("이건 좀 과장된 거 같아요")
              ↓
   → intent: "MODIFY_TONE" 으로 분류
              ↓
   [페이지가 payload 만들기]
   {
     messages: [...],
     currentStep: "CM2",
     userIntent: "MODIFY_TONE",
     selectedDraft: { ... },
     typeStylePrompt: A_TYPE_PROMPT,   ← A 타입 응답 스타일 같이
     ...
   }
              ↓
   fetch("/api/chat", { payload }) 호출
              ↓
[서버 — app/api/chat/route.ts]
   ① 공통 SYSTEM_PROMPT (정체성, CM1/CM2 규칙)
   ② typeStylePrompt (A 타입 스타일 규칙)
   ③ 현재 컨텍스트 (currentStep, userIntent, selectedDraft 등)
   ④ 대화 messages
              ↓
   OpenAI(gpt-4o-mini) 호출
              ↓
   AI가 JSON 응답:
   {
     "text": "톤을 좀 더 담백하게 다듬어볼게요.",
     "sections": [
       { "label": "1차 수정안", "content": "..." },
       { "label": "변경 이유", "content": "..." }
     ],
     "chips": ["1번 표현 선택", "다른 표현 제안"],
     "card": null
   }
              ↓
   parseOpenAIResponse → 정리된 데이터로
              ↓
   응답을 페이지로 돌려보냄
              ↓
[페이지 — A 타입]
   응답을 messages 배열에 추가
              ↓
   화면에 그리기:
   - text → 짧은 안내 (오브 + 답변 헤더 아래)
   - sections → 라벨드 섹션 (각 소타이틀 + 본문)
   - chips → 행동 버튼들
              ↓
[사용자가 응답 보고 다음 행동 — 또 다시 위로 ↑]
```

---

## 같이 참여하는 파일들

| 어느 단계에 | 어떤 파일이 |
|---|---|
| 메시지 입력 받기 | `app/A/page.tsx` |
| 의도 분류 | `app/classify-intent.ts` |
| 응답 스타일 정의 | `app/A/style-prompt.ts` |
| 사용자/AI 데이터 형식 | `app/agent-state.ts` |
| 초안 내용 (필요 시) | `app/drafts.ts` |
| OpenAI 호출 + 응답 정리 | `app/api/chat/route.ts` |
| 응답 화면에 그리기 | `app/A/page.tsx` |

---

## 자주 헷갈리는 Q&A

**Q. A 타입에서만 보이는 화면을 수정하려면 어디?**
→ `app/A/page.tsx`
→ [04번 문서](./04_A타입_화면.md)

**Q. A 타입 AI가 어떤 식으로 답할지를 수정하려면?**
→ `app/A/style-prompt.ts`
→ [05번 문서](./05_A타입_AI응답.md)

**Q. 모든 타입에서 보이는 *초안 내용*을 바꾸려면?**
→ `app/drafts.ts`
→ [07번 문서](./07_초안_데이터.md)

**Q. 사용자가 "이건 별로야"라고 했을 때 어떤 의도로 분류할지 바꾸려면?**
→ `app/classify-intent.ts`
→ [08번 문서](./08_의도_분류.md)

**Q. AI의 *전체적인 성격*(시니어 친화적으로, 단정짓지 않게 등)을 바꾸려면?**
→ `app/api/chat/route.ts` 의 `SYSTEM_PROMPT`
→ [09번 문서](./09_AI_백엔드.md)

**Q. A 타입의 *말투*만 바꾸려면?**
→ `app/A/style-prompt.ts` 의 `A_TYPE_PROMPT`
→ [05번 문서](./05_A타입_AI응답.md)

**Q. 새로운 타입(예: B 타입) 시작하려면?**
→ `app/A/` 폴더 통째로 복사 → `app/B/`로 이름 변경
→ `B_TYPE_PROMPT`로 이름 바꾸고 내용 수정
→ [02번 문서](./02_GUIDE.md) 참고

**Q. 사용자 의도에 따라 AI가 어떻게 다르게 반응할지 바꾸려면?**
→ `app/api/chat/route.ts` 의 `SYSTEM_PROMPT` 안 "[userIntent별 응답 규칙]" 부분
→ [09번 문서](./09_AI_백엔드.md)

**Q. 새 데이터 필드 추가하려면? (예: 초안에 "favorite" 표시 기능)**
→ 4단계:
1. `agent-state.ts` — `Draft` 인터페이스에 `favorite?: boolean` 추가
2. `drafts.ts` — 각 초안 객체에 값 설정
3. `app/A/page.tsx` — 화면에 어떻게 표시할지 추가
4. (필요하면) `api/chat/route.ts` — AI가 그 필드를 활용

**Q. 챗 응답 형식(text/chips/card/sections) 자체를 바꾸려면?**
→ 큰 작업이에요. 영향 범위:
1. `agent-state.ts` (응답 타입)
2. `api/chat/route.ts` (응답 파싱 + JSON 스키마)
3. 모든 page.tsx (응답 받아서 그리기)
→ 4 타입 다 동시에 손봐야 안 깨짐.

**Q. 베이스라인(`/`) 화면을 바꿔도 되나요?**
→ ❌ 가급적 X. 비교 기준점이라 그대로 두는 게 안전.
→ 정말 바꿔야 할 이유 있으면 팀과 상의.

**Q. 4 타입에 공통적인 변화를 한 번에 적용하려면?**
→ 공용 파일(`agent-state.ts`, `drafts.ts`, `classify-intent.ts`, `api/chat/route.ts`)을 수정하면 됨.
→ 4 타입 폴더는 각자 알아서 그 변화 반영.

---

## 디버깅 팁

**문제: AI 응답이 이상해요**
1. 브라우저 콘솔 열기 (F12)
2. 메시지 보내고 `[api/chat payload]` 로그 확인 — 무엇을 보냈는지
3. 터미널(npm run dev) 가서 `[api/chat] received state` 로그 확인 — 서버가 무엇을 받았는지
4. 두 로그가 다르면 페이지 코드 문제, 같으면 AI 프롬프트 문제

**문제: 화면이 안 떠요**
1. 터미널의 빨간 에러 메시지 읽기
2. 보통 *문법 오류* (괄호, 따옴표 등) → Cursor의 빨간 줄 따라가서 수정
3. 그래도 해결 안 되면 빨간 메시지 복사해서 팀 리더에게

**문제: 변경했는데 반영 안 돼요**
1. 파일 저장했나? (`Cmd + S`)
2. 터미널이 켜져 있나? (`npm run dev` 돌아가는 중인가)
3. 브라우저 새로고침 (`Cmd + R`)
4. 그래도 안 되면 터미널에서 `Ctrl + C`로 끄고 `npm run dev` 다시 켜기
