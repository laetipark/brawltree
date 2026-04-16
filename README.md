![](/service/frontend/public/images/logo/logo_horizontal.png)

# BrawlTree Service

## 💼 프로젝트 소개

`BrawlTree Service`는 브롤스타즈 전적 검색, 브롤러 분석, 맵 통계, 이벤트 로테이션, 뉴스 조회를 제공하는 통합 서비스입니다.  
이 저장소는 `NestJS API`와 `React 프론트엔드`를 하나의 런타임으로 운영하며, `crawler`가 적재한 MySQL 데이터를 읽어 사용자에게 제공합니다.

- API는 `/api/*` 경로에서 제공됩니다.
- 프론트엔드는 동일 서비스 프로세스에서 정적 서빙됩니다.
- `/cdn`, `/youtube`, `/inbox` 경로는 외부 리소스로 프록시됩니다.

### :file_folder: 제공 기능

- 플레이어 검색 및 전적 조회
    - 닉네임 검색
    - 프로필 조회
    - 브롤러 보유 현황 조회
    - 배틀 통계 / 배틀 로그 조회
- 브롤러 정보 조회
    - 전체 브롤러 목록
    - 브롤러 요약 통계
    - 랜덤 브롤러 추천
    - 개별 브롤러 상세 정보
- 맵 / 이벤트 분석
    - 트로피 리그 현재 이벤트
    - 트로피 리그 다음 이벤트
    - 파워 리그 맵 로테이션
    - 맵 상세 및 브롤러 통계
- 랭킹 / 뉴스 조회
    - 플레이어 랭킹
    - 클럽 랭킹
    - 브롤러 랭킹
    - 지역별 뉴스 목록 및 상세 조회

### 🛠️ 활용 기술 스택

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white">&nbsp;
<img src="https://img.shields.io/badge/Nest.js-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">&nbsp;
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">&nbsp;
<img src="https://img.shields.io/badge/TypeORM-FCAD03?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI1NiAyMzMiPjxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0xMzkgMzJhNiA2IDAgMCAxIDUgNnY2NWE2IDYgMCAwIDEtNSA1SDg2YTYgNiAwIDAgMS02LTVWMzhhNiA2IDAgMCAxIDYtNmg1M1ptMCAzSDg2YTMgMyAwIDAgMC0zIDN2NjVhMyAzIDAgMCAwIDMgM2g1M2EzIDMgMCAwIDAgMy0zVjM4YTMgMyAwIDAgMC0zLTNaTTkzIDkzdjNoLTN2LTNoM1ptNDIgMHYzSDk1di0zaDQwWk05MyA3NnY0aC0zdi00aDNabTQyIDB2NEg5NXYtNGg0MFpNOTMgNjF2M2gtM3YtM2gzWm00MiAwdjNIOTV2LTNoNDBabTAtMTV2NEg5MHYtNGg0NVptNCA3NmE2IDYgMCAwIDEgNSA1djY1YTYgNiAwIDAgMS01IDZIODZhNiA2IDAgMCAxLTYtNnYtNjVhNiA2IDAgMCAxIDYtNWg1M1ptMCAySDg2YTMgMyAwIDAgMC0zIDN2NjVhMyAzIDAgMCAwIDMgM2g1M2EzIDMgMCAwIDAgMy0zdi02NWEzIDMgMCAwIDAtMy0zWm0tNDYgNTh2NGgtM3YtNGgzWm00MiAwdjRIOTV2LTRoNDBabS00Mi0xNnYzaC0zdi0zaDNabTQyIDB2M0g5NXYtM2g0MFptLTQyLTE2djRoLTN2LTRoM1ptNDIgMHY0SDk1di00aDQwWm0wLTE1djRIOTB2LTRoNDVabTE5LTY1djNoMTl2ODZoLTE5djNoMjJWNzBoLTN6TTE5IDE1QzIzIDkgMjkgNSAzNSAzaDJsMS0xaDNsMS0xaDZsMS0xaDd2MTVjLTEzLTEtMTkgMy0yMiA3djFhMTMgMTMgMCAwIDAtMSAydjFoLTF2NjdsLTEgMXY5aC0xdjJjLTIgNS02IDktMTYgMTEgOSAyIDE0IDYgMTYgMTF2MmwxIDF2OGwxIDJ2NjZoMXYyYzIgNSA4IDEwIDIyIDloMXYxNUg0NmwtMS0xaC0yYTU5IDU5IDAgMCAxLTEgMCA1NiA1NiAwIDAgMS0xIDBoLTF2LTFoLTJjLTgtMi0xNS02LTIwLTE0YTMxIDMxIDAgMCAxIDE0LTI0bC0xIDFjLTggNS0xMiAxMy0xMyAyM2EyNyAyNyAwIDAgMS0yLTEydi05bC0xLTZ2LTIybC0xLTEwdi0xN2MwLTgtMy0xMi03LTEzdi0xSDZhOSA5IDAgMCAwLTEgMHYtMUgxYTMzIDMzIDAgMCAwLTEgMHYtMThoNmMzLTIgOC01IDgtMTRWODBsMS0xMVY0MmwxLTZ2LThjMC01IDEtMTAgMy0xM1ptMTgxIDBWMGgxMHYxaDVsMSAxaDNjOCAzIDE1IDcgMTkgMTVhMjcgMjcgMCAwIDEgMiAxMXY5bDEgM3YyNmwxIDl2MTdjMCA4IDQgMTIgNyAxNGgydjFoNXYxOGEyNSAyNSAwIDAgMC0yIDBoLTNsLTEgMWMtNCAxLTggNS04IDEzdjEzbC0xIDExdjI3bC0xIDd2N2EyOCAyOCAwIDAgMS0xIDl2MWMtNCA5LTEzIDE0LTIyIDE2aC0xbC0xIDFoLTZ2MWgtOXYtMTVjMTQgMSAyMC0zIDIyLThoMXYtM2gxdi02N2wxLTF2LThsMS0yIDEtMmMyLTUgNy04IDE1LTEwLTExLTItMTUtNy0xNi0xM2wtMS0xdi04bC0xLTJWMzlhMjcgMjcgMCAwIDAgMTEtMTNoMWEyOCAyOCAwIDAgMS0xMiAxM1YyN2ExNSAxNSAwIDAgMCAwLTEgMTUgMTUgMCAwIDAtMSAwdi0yYy0yLTUtOC0xMC0yMi05aC0xWiIvPjwvc3ZnPg==">
&nbsp;
<img src="https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white">&nbsp;
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">&nbsp;
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">&nbsp;
<img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white">

### :notebook: 주요 페이지 및 경로

- `/` : 메인 페이지
- `/brawlian/:id` : 사용자 프로필 및 전적
- `/brawler/:name` : 브롤러 상세 정보
- `/events/:mode` : 이벤트 로테이션
- `/maps` : 맵 목록
- `/maps/:name` : 맵 상세
- `/crew` : 크루 멤버 정보
- `/news` : 뉴스 목록
- `/news/:title` : 뉴스 상세

## #️⃣ 서비스 구조 소개

이 프로젝트는 `crawler -> MySQL -> service(api) -> frontend(ui)` 흐름으로 동작합니다.

- `crawler`가 브롤스타즈 관련 데이터를 수집하고 정규화된 MySQL 테이블에 적재합니다.
- `service/src`가 해당 데이터를 읽어 `/api/*` 엔드포인트를 제공합니다.
- `frontend/src/services`가 동일 오리진 API를 호출해 화면을 구성합니다.
- 운영 환경에서는 NestJS가 프론트엔드 정적 파일까지 함께 서빙합니다.

## :gear: 환경 설정 및 실행

- 환경 변수 샘플 파일은 아래 위치에 있습니다.
    - `service/.development.env.sample`
    - `service/.production.env.sample`
    - `service/frontend/.env.development.sample`
    - `service/frontend/.env.production.sample`
- 백엔드 주요 환경 변수는 아래와 같습니다.
  ```dotenv
  HOST_PORT=
  CRAWLER_HOST=
  DATABASE_HOST=
  DATABASE_PORT=
  DATABASE_USERNAME=
  DATABASE_PASSWORD=
  DATABASE_NAME=
  DATABASE_TIMEZONE=
  USER_BATTLES_QUERY_CACHE_TTL_MS=
  SERVICE_HTTP_LOG_MODE=error-slow
  SERVICE_HTTP_SLOW_MS=3000
  SERVICE_SQL_LOG_MODE=error-slow
  SERVICE_SQL_SLOW_MS=3000
  SERVICE_LOG_SQL_PARAMS=false
  SERVICE_LOG_HTTP_BODY=false
  ```
- 프론트엔드 주요 환경 변수는 아래와 같습니다.
  ```dotenv
  VITE_PORT=
  VITE_API_PROXY_TARGET=http://localhost:3000
  VITE_CDN_REMOTE_LOCALES=
  VITE_YOUTUBE_API_KEY=
  ```
- 의존성 설치
  ```bash
  cd service
  npm install
  npm --prefix frontend install
  ```
- API 개발 서버 실행
  ```bash
  cd service
  npm run start:dev
  ```
- 프론트엔드 개발 서버 실행
  ```bash
  cd service
  npm run frontend:dev
  ```
- 전체 빌드
  ```bash
  cd service
  npm run build
  ```
- 운영 실행
  ```bash
  cd service
  npm run start:prod
  ```
- PM2 실행
  ```bash
  cd service
  npm run start:pm2
  npm run start:pm2:backend
  npm run start:pm2:frontend
  npm run start:pm2:both
  npm run pm2:status
  npm run pm2:logs
  ```
  - `start:pm2`, `start:pm2:prod`: build 이후 Nest production server만 실행
  - `start:pm2:backend`: Nest development server만 실행
  - `start:pm2:frontend`: Vite frontend development server만 실행
  - `start:pm2:both`: backend/frontend development server를 함께 실행

## :cd: 디렉터리 구조

```text
service
|-- src
|   |-- configs
|   |-- features
|   |   |-- brawlers
|   |   |-- crew
|   |   |-- maps
|   |   |-- news
|   |   |-- rankings
|   |   `-- users
|   `-- utils
|-- frontend
|   |-- src
|   |   |-- components
|   |   |-- pages
|   |   |-- services
|   |   |-- hooks
|   |   |-- context
|   |   `-- common
|   `-- public
|-- docs
|-- http
`-- package.json
```

## :memo: API 명세

대표 API는 아래와 같습니다.

- `GET /api/brawlian/keyword`
- `GET /api/brawlian/:id`
- `GET /api/brawlian/:id/profile`
- `GET /api/brawlian/:id/brawlers`
- `GET /api/brawlian/:id/battles/stats`
- `GET /api/brawlian/:id/battles/logs`
- `GET /api/brawler`
- `GET /api/brawler/random`
- `GET /api/brawler/:id/info`
- `GET /api/events/tl/curr`
- `GET /api/events/tl/tomm`
- `GET /api/events/pl`
- `GET /api/maps`
- `GET /api/maps/:name`
- `GET /api/rankings/players`
- `GET /api/rankings/clubs`
- `GET /api/rankings/brawlers`
- `GET /api/news`
- `GET /api/news/:title`

> 로컬 요청 예시는 [`http/users/users.http`](./http/users/users.http) 파일과 [`docs/README.md`](./docs/README.md)에서 확인할 수 있습니다.
