// 의도 분류 eval 케이스.
//
// expected는 13_의도분류_정책.md 기준 "정답"이다 (현재 classify-intent.ts 동작이 아님).
// 현재 분류기는 이 정책을 완전히 구현하지 않았으므로, eval을 돌리면 통과율이
// 낮게 나오는 것이 정상이며, 실패 목록이 곧 분류기 개선 to-do 리스트가 된다.
//
// expected 값: ACCEPT / REJECT / MODIFY_TONE / MODIFY_CONTENT / ASK_REASON /
//   ASK_ALTERNATIVE / NEXT_ITEM / UNCERTAIN / LOW_CONFIDENCE / CLARIFY
//   ("CLARIFY" = 명확화 되묻기. 현재 분류기엔 없는 값 — 추가 구현 필요 신호)

export interface IntentTestCase {
  input: string;
  expected: string;
  note?: string;
}

export const INTENT_TEST_CASES: IntentTestCase[] = [
  // ─── ACCEPT ───
  { input: "이걸로 할게요", expected: "ACCEPT" },
  { input: "이거 좋네요", expected: "ACCEPT" },
  { input: "이게 좋아요", expected: "ACCEPT" },
  { input: "이걸로 결정할게요", expected: "ACCEPT" },
  { input: "이거 마음에 들어요", expected: "ACCEPT" },
  { input: "이대로 가죠", expected: "ACCEPT" },
  { input: "이대로 반영해주세요", expected: "ACCEPT" },
  { input: "이게 적당한 것 같네요", expected: "ACCEPT" },
  { input: "네 이거면 됐어요", expected: "ACCEPT" },
  { input: "이걸로 가겠습니다", expected: "ACCEPT" },

  // ─── REJECT ───
  { input: "이건 좀 아닌 것 같아요", expected: "REJECT" },
  { input: "이건 별로네요", expected: "REJECT" },
  { input: "이거 말고요", expected: "REJECT" },
  { input: "이건 빼주세요", expected: "REJECT" },
  { input: "이건 제 스타일이 아니네요", expected: "REJECT" },
  { input: "이건 좀 어색해요", expected: "REJECT" },
  { input: "이거는 좀…", expected: "REJECT" },
  { input: "이건 안 맞는 것 같아요", expected: "REJECT" },
  { input: "이 초안은 영 별로네요", expected: "REJECT" },
  { input: "이건 마음에 안 들어요", expected: "REJECT" },

  // ─── MODIFY_TONE ───
  { input: "덜 과장되게 해주세요", expected: "MODIFY_TONE" },
  { input: "좀 더 겸손하게 표현해주세요", expected: "MODIFY_TONE" },
  { input: "이거 너무 자랑 같아요", expected: "MODIFY_TONE" },
  { input: "좀 차분한 어투로 바꿔주세요", expected: "MODIFY_TONE" },
  { input: "너무 강한 표현이에요", expected: "MODIFY_TONE" },
  { input: "너무 단정적이지 않게 해주세요", expected: "MODIFY_TONE" },
  { input: "좀 부드럽게 다듬어주세요", expected: "MODIFY_TONE" },
  { input: "이거 너무 셉니다", expected: "MODIFY_TONE" },
  { input: "조금 톤다운 해주세요", expected: "MODIFY_TONE" },
  { input: "잘난 척하는 느낌이 들어요", expected: "MODIFY_TONE" },

  // ─── MODIFY_CONTENT ───
  { input: "제가 한 일이랑 좀 다른데요", expected: "MODIFY_CONTENT" },
  { input: "이건 제가 안 해본 일이에요", expected: "MODIFY_CONTENT" },
  { input: "제 경험에 맞게 바꿔주세요", expected: "MODIFY_CONTENT" },
  { input: "12년이 아니라 10년이에요", expected: "MODIFY_CONTENT" },
  { input: "이 수치는 제가 한 게 아니에요", expected: "MODIFY_CONTENT" },
  { input: "제 업무 범위랑 어긋나요", expected: "MODIFY_CONTENT" },
  { input: "이런 표현은 제 일이랑 안 맞아요", expected: "MODIFY_CONTENT" },
  { input: "실제 한 업무는 이거랑 달라요", expected: "MODIFY_CONTENT" },
  { input: "이 부분은 실제 사실이 아니에요", expected: "MODIFY_CONTENT" },
  { input: "이건 제가 한 게 아니라 팀에서 한 거예요", expected: "MODIFY_CONTENT" },

  // ─── ASK_REASON ───
  { input: "왜 이 표현이 좋은가요?", expected: "ASK_REASON" },
  { input: "이걸 추천한 이유가 뭐예요?", expected: "ASK_REASON" },
  { input: "왜 이렇게 바꾼 거예요?", expected: "ASK_REASON" },
  { input: "어떤 점에서 더 나은 표현인가요?", expected: "ASK_REASON" },
  { input: "이게 왜 좋다고 보시는지 궁금해요", expected: "ASK_REASON" },
  { input: "이유를 좀 설명해줄 수 있어요?", expected: "ASK_REASON" },
  { input: "왜 이 초안을 권하는 건가요?", expected: "ASK_REASON" },
  { input: "왜 그렇게 다듬은 거예요?", expected: "ASK_REASON" },
  { input: "이렇게 바꾼 근거가 뭐예요?", expected: "ASK_REASON" },
  { input: "어떤 면에서 좋다는 거예요?", expected: "ASK_REASON" },

  // ─── ASK_ALTERNATIVE ───
  { input: "다른 표현도 보고 싶어요", expected: "ASK_ALTERNATIVE" },
  { input: "또 다른 거 있어요?", expected: "ASK_ALTERNATIVE" },
  { input: "다른 옵션도 보여주세요", expected: "ASK_ALTERNATIVE" },
  { input: "다른 식으로도 표현해줄 수 있어요?", expected: "ASK_ALTERNATIVE" },
  { input: "다른 방향도 보고 싶네요", expected: "ASK_ALTERNATIVE" },
  { input: "또 어떤 표현이 가능한가요?", expected: "ASK_ALTERNATIVE" },
  { input: "비슷한 거 더 보여주세요", expected: "ASK_ALTERNATIVE" },
  { input: "다른 버전도 있어요?", expected: "ASK_ALTERNATIVE" },
  { input: "다른 후보도 한번 보고 싶어요", expected: "ASK_ALTERNATIVE" },
  { input: "또 보여줄 수 있어요?", expected: "ASK_ALTERNATIVE" },

  // ─── NEXT_ITEM (현재 분류기에 없는 의도 — 전부 실패 예상) ───
  { input: "다음 거 봐요", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "다음 항목으로 넘어가요", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "이건 됐고 다음 거", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "다음으로 넘어갈게요", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "그 다음은 뭐예요?", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "이거 말고 다음 거 보여주세요", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "다음 문장 보죠", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "넘어가요", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "이건 이대로 두고 다음 거 볼게요", expected: "NEXT_ITEM", note: "분류기 미구현" },
  { input: "다음 검토 항목 보여주세요", expected: "NEXT_ITEM", note: "분류기 미구현" },

  // ─── UNCERTAIN ───
  { input: "잘 모르겠어요", expected: "UNCERTAIN" },
  { input: "어떤 게 나은지 모르겠네요", expected: "UNCERTAIN" },
  { input: "둘 다 비슷해 보여요", expected: "UNCERTAIN" },
  { input: "차이를 잘 모르겠어요", expected: "UNCERTAIN" },
  { input: "뭐가 더 좋은지 판단이 안 서네요", expected: "UNCERTAIN" },
  { input: "한참 봐도 잘 모르겠어요", expected: "UNCERTAIN" },
  { input: "결정하기 어려워요", expected: "UNCERTAIN", note: "어렵 → LOW_CONFIDENCE 오분류 가능" },
  { input: "글쎄요", expected: "UNCERTAIN" },
  { input: "음… 잘 모르겠는데요", expected: "UNCERTAIN" },
  { input: "이거랑 저거가 비슷한 것 같은데", expected: "UNCERTAIN" },

  // ─── LOW_CONFIDENCE ───
  { input: "자신이 없네요", expected: "LOW_CONFIDENCE" },
  { input: "이게 맞나 싶어요", expected: "LOW_CONFIDENCE" },
  { input: "어렵게 느껴져요", expected: "LOW_CONFIDENCE" },
  { input: "이런 거 한 번도 안 써봐서요", expected: "LOW_CONFIDENCE" },
  { input: "부담스럽네요", expected: "LOW_CONFIDENCE" },
  { input: "제가 이렇게 표현해도 되나요?", expected: "LOW_CONFIDENCE" },
  { input: "너무 거창한 것 같은데", expected: "LOW_CONFIDENCE" },
  { input: "잘 할 수 있을까요", expected: "LOW_CONFIDENCE" },
  { input: "내가 이렇게 써도 괜찮을지…", expected: "LOW_CONFIDENCE" },
  { input: "이런 표현이 너무 낯설어요", expected: "LOW_CONFIDENCE" },

  // ─── 모호 케이스 (13_의도분류_정책.md 8장) ───
  { input: "괜찮긴 한데 다른 것도 보고 싶네요", expected: "ASK_ALTERNATIVE", note: "복합 — Tier2 > Tier3" },
  { input: "이게 부담스러운데 다른 표현 가능해요?", expected: "ASK_ALTERNATIVE", note: "복합 — Tier2 > Tier4" },
  { input: "이건 빼주시고 다른 거 추천해주세요", expected: "ASK_ALTERNATIVE", note: "복합 — Tier2 > Tier3" },
  { input: "부드럽게 해주시고 다른 것도 보여주세요", expected: "MODIFY_TONE", note: "복합 — Tier1 > Tier2" },
  { input: "이거 너무 잘 쓴 것 같아 부담돼요", expected: "CLARIFY", note: "고쳐달란 건지 불명확" },
  { input: "글쎄요 다른 것도 봤으면 좋겠긴 한데", expected: "ASK_ALTERNATIVE", note: "복합 — Tier2 > Tier4" },
  { input: "과장 같은데 제가 한 게 맞긴 해요", expected: "MODIFY_TONE", note: "사실은 맞음 → CONTENT 아님" },
  { input: "나쁘진 않은데", expected: "CLARIFY", note: "신호 약함" },
  { input: "더 낫긴 한데 자신은 없네요", expected: "ACCEPT", note: "복합 — Tier3 > Tier4, 톤은 안심" },
  { input: "좋긴 한데 좀 그래요", expected: "CLARIFY", note: "ACCEPT·REJECT 모순" },
  { input: "이거 왜 이렇게 바꿨더라", expected: "ASK_REASON" },
  { input: "이건 좀 아닌 것 같고 차라리…", expected: "REJECT", note: "말 미완성, 되묻기 동반" },
  { input: "이건 빼고 이건 살려주세요", expected: "MODIFY_CONTENT", note: "특정 부분 취사선택" },
  { input: "이거 너무 부풀려진 거 아닌가요", expected: "CLARIFY", note: "표현 과장? 사실 의심? 갈림" },
  { input: "다른 거 보고 결정할게요", expected: "ASK_ALTERNATIVE", note: "결정은 미래 턴" },
  { input: "이건 일단 넘어갈게요", expected: "NEXT_ITEM", note: "복합 — 현재 보류" },
  { input: "이거 됐고 다음 거", expected: "NEXT_ITEM", note: "복합 — ACCEPT+NEXT, NEXT 우선" },
  { input: "이건 별로니까 다음 거 봐요", expected: "NEXT_ITEM", note: "복합 — REJECT+NEXT, NEXT 우선" },
  { input: "잘 모르겠으니 다음 거 먼저 볼게요", expected: "NEXT_ITEM", note: "복합 — Tier3 > Tier4" },
];
