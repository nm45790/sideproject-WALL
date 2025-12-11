# Gemini 프로젝트 분석: warr

이 문서는 `warr` 프로젝트의 파일 구조와 내용을 기반으로 분석한 개요입니다.

## 프로젝트 개요

- **프레임워크**: [Next.js](https://nextjs.org/) (App Router 사용)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **패키지 매니저**: [pnpm](https://pnpm.io/) (`pnpm-lock.yaml` 파일로 추정)
- **스타일링**: PostCSS를 사용하는 CSS.
- **린팅/포맷팅**: ESLint 와 Prettier.

이 프로젝트는 반려동물 소유자("parent")와 반려동물 관련 시설("academy", 예: 펫 유치원, 훈련소)을 연결해주는 서비스를 위한 웹 애플리케이션으로 보입니다.

## 핵심 기능 및 개념

### 1. 사용자 역할

이 애플리케이션에는 최소 두 가지 주요 사용자 역할이 있는 것으로 보입니다:
- **Parent (학부모)**: 자신의 반려동물을 위한 서비스를 찾고 관리하기 위해 가입하는 반려동물 소유자일 가능성이 높습니다.
- **Academy (교육기관)**: 시설, 일정, 고객 신청 등을 관리하는 서비스 제공자(예: 펫 스쿨, 데이케어)입니다.

### 2. 인증 및 사용자 관리
- **회원가입**: `parent`와 `academy` 역할 모두를 위한 포괄적인 다단계 회원가입 프로세스가 존재합니다.
  - `app/signup/role/page.tsx`: 초기 역할 선택.
  - `app/signup/[role]/...`: 개인 정보, 전화 인증, 사진 등 세부 정보를 포함하는 각 역할에 대한 별도의 가입 절차.
- **로그인**: `app/login/page.tsx`
- **계정 복구**: `app/find/` 아래에 사용자 ID를 찾고 비밀번호를 재설정하는 기능이 존재합니다.
- **계정 탈퇴**: `app/leave/page.tsx`

### 3. 반려동물 관리
- 반려동물 프로필이 애플리케이션의 핵심적인 부분인 것으로 보입니다.
- **컴포넌트**: `PetCard.tsx`, `AddPetCard.tsx`는 학부모가 자신의 반려동물을 추가하고 볼 수 있음을 시사합니다.
- **데이터**: `app/constants/breeds.ts`는 반려동물 품종 정보가 저장되고 사용됨을 나타냅니다.

### 4. 교육기관 기능
- **관리**: 교육기관은 운영을 총괄하기 위한 전용 대시보드(`app/academy/manage/page.tsx`)를 가집니다.
- **신청 처리**: `app/academy/accept/page.tsx`는 학부모로부터의 신청을 검토하고 수락하는 시스템을 시사합니다.
- **상태 및 설정**: 교육기관은 자신의 상태와 설정을 관리할 수 있습니다.

### 5. 상태 관리
- 클라이언트 측 상태는 스토어 기반 솔루션(아마도 Zustand 또는 유사 라이브러리)을 사용하여 관리됩니다.
- `app/store/signupStore.ts`: 다단계 가입 프로세스를 위한 상태를 특별히 관리합니다.
- `app/store/stateStore.ts`: 더 일반적인 애플리케이션 상태를 저장할 가능성이 높습니다.

### 6. 기술적 세부사항
- **API 통신**: 애플리케이션은 API 요청을 위해 프록시(`app/api/proxy/route.ts`)를 사용합니다. 이는 CORS 문제를 피하고 Next.js 서버가 백엔드 서비스와 통신하게 함으로써 API 키를 안전하게 처리하는 일반적인 패턴입니다.
- **유틸리티**: 풍부한 유틸리티 함수(`app/utils/`) 세트가 API 호출, 인증, 날짜 형식 지정, 이미지 처리 등과 같은 일반적인 작업을 처리합니다.
- **커스텀 훅**: `app/hooks/useDebouncedRequest.ts`는 사용자 입력 시 과도한 API 호출을 방지하는 등의 최적화가 적용되었음을 시사합니다.

## 주요 파일 구조

- `app/`: Next.js App Router 규칙을 따르는 핵심 애플리케이션 로직.
- `app/components/`: 재사용 가능한 리액트 컴포넌트.
- `app/constants/`: 목(mock) 데이터 및 애플리케이션 전반의 상수.
- `app/store/`: 전역 상태 관리 스토어.
- `app/utils/`: 헬퍼 함수 및 유틸리티.
- `public/`: 이미지, `robots.txt`와 같은 정적 자산.
- `package.json`: 프로젝트 종속성 및 스크립트 목록.
- `next.config.ts`: Next.js 설정 파일.