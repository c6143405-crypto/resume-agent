// app/scenarios/types.ts
// 모든 직무 시나리오가 따라야 하는 공통 데이터 스키마.
//
// 설계 원칙:
// - A/B/C/D 네 타입이 모두 같은 데이터를 받아온다.
// - 텍스트 콘텐츠는 한 곳(이 스키마)에서만 정의된다.
// - 시각 자산(이모지, 해시태그 등)은 데이터에 nested로 저장하되, 어떤 자산을
//   렌더링할지는 각 타입 페이지가 결정한다 (A는 무시, B는 사용 등).
// - 새 직무 시나리오를 추가하려면 이 스키마를 따르는 파일을 새로 만들고
//   index.ts의 SCENARIOS 매핑에 한 줄 추가하면 된다.

// CM1에서 사용자가 비교하는 초안의 작성 방향.
// 1차 본조사에서 사용한 3가지 방향과 1:1 매칭된다.
export type DraftDirection =
  | "achievement" // 성과 중심: 수치·결과 강조
  | "fit"         // 직무 적합 중심: 협업·검증·직무 역량
  | "narrative";  // 경험 서사 중심: 시간 흐름·역할 변화

// 한 줄짜리 업무/성과 항목.
// - text: 모든 타입 공통으로 노출되는 텍스트.
// - emoji: B 타입에서만 항목 앞에 렌더. 다른 타입은 무시.
export interface DraftBullet {
  text: string;
  emoji?: string;
}

// 프로젝트 요약 블록.
// - number: 프로젝트 번호 (A/B는 "1", C는 "01"처럼 두 자리 패딩 렌더 가능)
// - title: 프로젝트 제목
// - description: 프로젝트 개요 한 단락. C 타입은 title/description을
//   카드로 분리해서 렌더할 수 있다.
export interface DraftProject {
  number: number;
  title: string;
  description: string;
}

// CM2에서 사용자가 다듬을 한 문장 단위. 각 초안마다 1건씩 정의한다.
export interface DraftRefinementTarget {
  originalSentence: string;
  revisedSentence: string;
  changeReason: string;
}

// CM1에서 비교 대상이 되는 한 초안의 전체 데이터.
export interface Draft {
  draftId: string;             // 예: "accounting-manager:draft-01"
  draftTitle: string;          // CM1 리스트의 라벨 (예: "성과 중심 초안")
  direction: DraftDirection;
  hashtags: string[];          // B 타입 해시태그 (3개 권장)
  project: DraftProject;
  tasks: DraftBullet[];        // [업무 상세] 영역
  achievements: DraftBullet[]; // [역할 및 성과] 영역
  whyRecommended: string;      // "이 초안이 추천된 이유" 설명
  caution: string;             // "이 초안의 주의점" 설명
  refinementTarget: DraftRefinementTarget;
}

// 시나리오 화자(가상 사용자) 페르소나.
export interface ScenarioPersona {
  company: string; // 예: "(주) A 의류 유통 기업"
  period: string;  // 예: "2012.03 ~ 현재 (12년 2개월)"
  role: string;    // 예: "회계팀 과장"
}

// 한 직무 시나리오의 최상위 컨테이너.
// drafts는 정확히 3개로 고정해 CM1의 비교 구조와 일치시킨다 (성과/직무/서사 순서 권장).
export interface Scenario {
  scenarioId: string;             // 예: "accounting-manager" (URL 파라미터로 사용)
  jobTitle: string;               // 화면에 표시될 직무명
  jobCategory: string;            // 구글폼 응답 매칭용 카테고리 (예: "회계/재무")
  persona: ScenarioPersona;
  drafts: [Draft, Draft, Draft];  // 성과 / 직무 / 서사 3종 고정
}
