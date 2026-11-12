# Research 페이지 작성 가이드 (한국어 페이지 용어 규칙 · Glossary · 섹션 인트로)

작성: 2026-11-12, Power Project 대화에서 정리  
용도: 홈페이지(page publish) 대화에 그대로 전달해 research 페이지 한국어판·영어판에 반영한다.  
범위: 문장 표기·용어·인트로 구조에 대한 규칙이다. 연구 결과 숫자는 바꾸지 않는다.

---

## 0. 홈페이지 작업자(Claude)에게

1. 아래 1절 규칙을 research 페이지 **한국어판 전체**에 적용한다. 영어판은 그대로 두되 용어 표기가 2절 Glossary와 일치하는지 확인한다.
2. 기존 목차 구조는 유지하고, 목차·섹션 제목만 영어 표기로 통일한다.
3. 2절 Glossary를 research 페이지 하단에 **Glossary** 섹션으로 추가한다. 페이지에는 `English term`과 `한국어 한 줄 설명` 두 칸만 싣는다. `내 말로 설명` 칸은 연구자의 학습 체크리스트이며 페이지에 싣지 않는다.
4. 3절 섹션 인트로의 **대괄호 [ ] 부분은 연구자 본인이 답해야 하는 내용**이다. 연구자의 답 없이 생각·동기·누가 제안했는지를 지어내지 않는다. 답이 오기 전까지 해당 인트로는 비워 두거나 기록된 사실 부분만 싣는다.
5. 4절 문단(1단계가 그렇게 진행된 이유)은 연구자가 확인한 문장이다. 그대로 쓰거나 다듬기만 한다.

---

## 1. 한국어 페이지 표기 규칙

| # | 규칙 | 예 |
|---|---|---|
| 1 | **목차와 섹션 제목은 영어로** 쓴다. 영어판과 1:1로 대응시킨다. | `Stage 1: Operating Margin`, `Stage 2: N-1 Security` |
| 2 | **핵심 용어는 처음 나올 때만 `English(한국어)`**, 이후에는 영어만 쓴다. | 처음: "margin(한계까지 남은 거리)" → 이후: "margin" |
| 3 | **한국어로 정착된 일반 단어는 한국어로** 쓴다. | 전압, 선로, 변압기, 발전기, 부하, 손실, 수요 |
| 4 | **한 개념에는 한 가지 표기만** 쓴다. "여유/마진/margin" 혼용 금지. | margin으로 통일 |
| 5 | **숫자와 단위는 번역하지 않는다.** | MW, Mvar, pu, 105 MW |
| 6 | 서술 문장은 한국어로 자연스럽게 쓴다. 영어 단어에 한국어 조사를 붙이는 것은 괜찮다. | "Criterion B를 통과하지 못했다" |
| 7 | 모선 번호는 `bus 4`, `bus 13`처럼 영어로 쓴다. PV bus, PQ bus와 표기를 맞추기 위해서다. | "bus 4에 데이터센터를 연결했다" |

### 특히 한국어로 옮기면 안 되는 용어

| 영어로 유지 | 이유 |
|---|---|
| N-1 security | "안전성"과 "안정성(stability)"이 한 글자 차이로 전혀 다른 개념이다 |
| margin / buffer | 둘 다 "여유"가 되기 쉬우나 이 연구에서는 다른 개념이다 |
| Criterion A/B/C, Model variant A | 같은 "A"가 두 가지 뜻이다 |
| power flow (PF), OPF | 약어 체계를 맞춘다 |
| PV / PQ / slack bus | 정착된 한국어 번역이 없다 |
| convergence | 핵심 메시지 "convergence ≠ feasibility"를 그대로 전달한다 |
| NERC TPL-001, P1 contingency | 고유명사다 |

---

## 2. Glossary 초안

`한국어 한 줄 설명`은 페이지에 싣는 참고 설명이다. `내 말로 설명`은 연구자가 공부하면서 직접 채우는 칸이고, 채울 수 있으면 그 용어는 이해한 것으로 본다.

### 2.1 계통과 모델

| English term | 한국어 한 줄 설명 | 이 프로젝트에서 | 내 말로 설명 |
|---|---|---|---|
| Power system | 발전기·송전망·부하로 이루어진 전력망 전체 | 연구 대상 | |
| Bus | 발전기·부하·선로가 만나는 접속점(모선) | 24개 bus | |
| Branch | 두 bus를 잇는 선로 또는 변압기 | 사고(outage) 대상 | |
| IEEE RTS-24 | 공개된 24-bus 시험용 전력망(benchmark) | 연구 계통 | |
| Benchmark system | 누구나 같은 데이터로 재현·비교할 수 있는 표준 시험 계통 | RTS-24를 쓴 이유 | |
| Model variant A | 이 프로젝트에서 쓴 RTS-24 입력 데이터 버전 이름. Criterion A와 무관 | 모든 현재 결과 | |
| Data center load | bus 4에 추가한 일정 P/Q 부하 | 90~110 MW, Q = 0.25P(연구 가정) | |
| Static generator (sgen) | 입력한 P/Q를 그대로 유지하는 고정 발전원 | 22개, Q margin 기준에서 제외 | |
| Responsive sources | 계산 중 출력(Q 등)이 반응하는 발전원 | 일반 발전기 10개 + reference source 1개 | |

### 2.2 전기량과 단위

| English term | 한국어 한 줄 설명 | 이 프로젝트에서 | 내 말로 설명 |
|---|---|---|---|
| Active power (P), MW | 실제로 일을 하는 전력 | 데이터센터 크기, 발전기 출력 | |
| Reactive power (Q), Mvar | 전압 유지와 관련된 전력. 일을 하지 않지만 흘러야 하는 성분 | 발전기 Q 한계, Q margin | |
| Voltage magnitude (Vm) | 실제 계산된 bus 전압의 크기 | voltage margin 판정 | |
| Voltage setpoint (Vg) | 발전기에 입력한 전압 목표값. 실제 Vm과 다를 수 있음 | 고정 설정의 일부 | |
| Per unit (pu) | 기준값 대비 비율로 나타낸 값. 1.0 pu = 기준 전압 | 전압 표기 | |
| Losses | 송전 중 선로에서 사라지는 전력 | reference source가 손실까지 포함해 P 수지를 맞춤 | |

### 2.3 계산 방법

| English term | 한국어 한 줄 설명 | 이 프로젝트에서 | 내 말로 설명 |
|---|---|---|---|
| Power flow (PF) | 주어진 발전·부하에서 전압과 전력 흐름을 계산(조류계산) | 29회 고유 실행 | |
| AC power flow | P와 Q, 전압 크기와 각도를 모두 푸는 조류계산. 데이터센터 "DC"와 무관 | 현재 핵심 계산 | |
| Newton-Raphson (NR) | PF 방정식을 반복해서 푸는 수치 방법 | PF solver | |
| Convergence | 반복 계산의 오차가 기준 이하로 줄어 해를 얻은 상태 | 물리 한계 충족과 별개로 판정 | |
| Feasibility | 계산 결과가 실제 한계를 모두 지키는 상태 | "convergence ≠ feasibility" | |
| Optimal power flow (OPF) | 한계를 지키면서 목표(비용 등)를 최적화하는 조류계산 | 4개 설정을 만드는 데 4회 사용 | |
| Steady-state (static) analysis | 한 시점의 안정된 상태만 보는 해석(사진 한 장) | 이 연구의 범위 | |
| Stability (dynamic) analysis | 사고 직후 수 초간의 시간 변화를 보는 해석(영상) | 범위 밖 | |

### 2.4 bus 종류와 제어

| English term | 한국어 한 줄 설명 | 이 프로젝트에서 | 내 말로 설명 |
|---|---|---|---|
| PQ bus | P와 Q를 입력하고 전압을 계산하는 bus | 부하 bus, Q 한계에 걸린 발전기 | |
| PV bus | P와 전압 목표를 입력하고 Q를 계산하는 bus | 일반 발전기 | |
| Slack (reference) bus | 손실 포함 P 수지를 맞추는 기준 bus | bus 13의 reference source | |
| Reference source | slack bus의 발전원. P 수지를 맞추지만 Q 반응은 다른 발전기들과 나눔 | 원래 한계 P 69~197 MW, Q 0~80 Mvar | |
| Q limit enforcement | 발전기 Q가 한계를 넘으면 한계값에 고정하는 계산 규칙 | Q limit off/on 비교 | |
| PV → PQ switching | Q가 한계에 고정되면서 전압 목표를 풀어 주는 전환 | 106.25 MW에서 Gen 1 | |

### 2.5 판정 기준

| English term | 한국어 한 줄 설명 | 이 프로젝트에서 | 내 말로 설명 |
|---|---|---|---|
| Physical limit | 설비가 원래 견딜 수 있는 한계(정격, 전압 범위 등) | Criterion A가 검사 | |
| Margin | 현재 값에서 physical limit까지 남은 거리 | P/Q/voltage margin | |
| Buffer | 연구자가 정한 margin 목표값. 규정이 아님 | Q 0.25 Mvar, 전압 0.001 pu, P 1 MW | |
| Criterion A | physical limit을 모두 지켰는가 | 공급·전압·정격·발전기 P/Q 등 | |
| Criterion B | 선택한 Q·voltage buffer를 남겼는가 | responsive sources 11개, bus 24개 | |
| Criterion C | reference source P buffer를 남겼는가 | P0Q0에는 당시 not applied | |
| Design range (P0/P1, Q0/Q1) | OPF에서 reference source에 준 P/Q 설계 범위 표기. "0"은 제약 없음이 아님 | 네 설정 비교 | |
| Demand test points | 미리 정한 17개 데이터센터 수요값 | 90 + 1.25k MW, k = 0~16 | |

### 2.6 Stage 2: N-1 security

| English term | 한국어 한 줄 설명 | 이 프로젝트에서 | 내 말로 설명 |
|---|---|---|---|
| N-1 security | 설비 하나가 빠져도 계통이 한계를 지키는지 보는 정상상태 검사 | Stage 2 주제 | |
| Contingency / outage | 설비 하나가 고장 등으로 빠지는 사건 | 선로·변압기·발전기 | |
| NERC TPL-001 | 미국 송전 계획 신뢰도 기준 | 판정 기준의 근거(TPL-001-5.1) | |
| P1 event | TPL-001의 단일 사고 범주 | Stage 2 사고 목록 | |
| Facility rating | 설비가 견딜 수 있는 전력·전류 정격 | 사고 후 판정 | |
| Emergency rating | 사고 후 짧은 시간 허용되는 더 높은 정격 | 사용 여부 결정 대기(D2) | |
| Islanding | 사고로 계통 일부가 떨어져 나가는 것 | 이전 스크리닝에서 선로 7-8 | |
| Consequential load loss | 빠진 설비에 직접 붙어 있던 부하만 잃는 것. TPL-001 P1에서 허용 | D4 판단 | |
| Re-dispatch | 사고 후 발전기 출력을 다시 나누는 조정 | D3 판단 | |
| Hosting capacity | 한계를 지키며 연결할 수 있는 최대 부하 | Stage 3 주제, 아직 주장하지 않음 | |
| Independent solver check | 다른 프로그램으로 같은 계산을 다시 해 대조하는 검증 | D7 | |

---

## 3. 섹션 인트로 구조

각 섹션 맨 앞에 3~5문장짜리 인트로를 둔다. 결과 요약이 아니라 **연구자의 생각 흐름**을 보여 주는 문단이다.

| 부분 | 들어갈 내용 |
|---|---|
| 1. 내가 던진 질문 | 이 섹션에서 무엇이 궁금했는가. 질문으로 시작한다 |
| 2. 내가 정한 것과 AI가 도운 것 | 방향·범위·기준은 누가 정했고, 계산·코드는 누가 했는가 |
| 3. 보고 나서 이해한 것과 바꾼 것 | 결과로 알게 된 것, 그래서 다음에 바꾼 것 |

피할 문장: "본 섹션에서는 다양한 조건에서 운전 여유를 분석하였다"처럼 누가 써도 같은 문장.  
좋은 문장: "처음에는 계산이 수렴하면 문제가 없다고 생각했다"처럼 연구자만 쓸 수 있는 문장.

### 3.1 연구자가 답할 질문 (답변 대기)

| # | 질문 | 연구자 답 |
|---|---|---|
| Q1 | 데이터센터를 주제로 고른 이유와 관심의 계기 | AI 업계의 이슈가 데이터센터이고, 엔지니어링은 사람의 삶을 더 편리하고 조화롭게 하는 일이라고 생각한다. 데이터센터가 들어서면서 기존 가구의 전력 공급 문제·소음·정전 같은 이슈가 이어지고 있어, 애초에 설계부터 효율적으로 해서 재발을 막을 수 없을까 하는 의문에서 시작했다. (2026-11-12) |
| Q2 | 첫 계산에서 "수렴했는데 위반"이 나왔을 때 어떻게 받아들였고, 방향 전환은 누가 먼저 꺼냈나 | ChatGPT와 함께 진행한 부분이라 공부하면서 나중에 보충한다. (2026-11-12) |
| Q3 | P/Q 범위를 따로 바꿔 보는 네 설정 비교는 누구 아이디어였고 무엇이 궁금했나 | 연구자는 단순한 상황(데이터센터 연결)만 정했고, 여러 설정값을 두고 비교하자는 것은 ChatGPT의 의견이었다. (2026-11-12) |
| Q4 | 가장 의외였던 결과 하나와 지금의 이해 | (대기, 학습 진행 후) |
| Q5 | 다시 한다면 무엇을 다르게 할지 | (대기, 학습 진행 후) |

### 3.2 인트로 뼈대 예시 (기록된 사실만, 대괄호는 연구자 몫)

> **왜 운전 margin을 먼저 보게 됐나**
> 처음 질문은 "데이터센터를 붙였을 때 사고가 나도 전력망이 버티는가"였다. 그런데 IEEE RTS-24로 첫 계산을 했을 때 power flow는 convergence에 도달했지만, 데이터센터 없이도 이미 physical limit을 넘었다. [연구자: 그때 어떻게 받아들였는지] 그래서 사고를 보기 전에 정상 상태에서 한계를 지키는 운전점부터 확보하기로 했다. [연구자: 누가 먼저 제안했는지] 계산과 코드는 Claude Code와 Codex가 수행했고, 나는 범위와 판정 기준을 정하고 결과를 검토했다.

### 3.3 완성된 인트로 (연구자 답 Q1·Q3 기반, 바로 사용 가능)

용어 주의: 연구자의 답에 있는 "전력안정성"은 페이지에서 **전력 공급 신뢰성(reliability)** 으로 쓴다. "안정성(stability)"은 동특성 해석을 뜻하는 다른 용어라 혼동을 피한다.

#### (1) Research overview / Motivation 섹션 인트로 — Q1 기반

**한국어**
> 이 연구는 하나의 의문에서 시작했다. 나는 엔지니어링이 사람들의 삶을 조금 더 편리하고 조화롭게 만드는 일이라고 생각한다. 그런데 AI 산업이 커지면서 데이터센터가 빠르게 들어서고, 주변의 기존 가구들이 전력 공급 reliability(신뢰성), 정전, 소음 같은 문제를 겪는다는 이야기가 이어지고 있다. 문제가 생긴 뒤에 대응하기보다, 처음 계획하고 설계하는 단계에서부터 이런 문제를 막을 수는 없을까? 이 연구는 그중 전력망 쪽 질문을 다룬다. 큰 데이터센터 부하를 연결했을 때 기존 전력망이 limit을 지키고 margin을 남길 수 있는지를 계산으로 살펴본다. 소음 같은 다른 문제는 이 연구의 범위가 아니다.

**English**
> This study started from a single question. I see engineering as work that makes people's lives a little more convenient and more harmonious. As the AI industry grows, data centers are being built quickly, and there are continuing reports of nearby households facing problems such as less reliable power supply, outages and noise. Instead of responding after problems appear, could they be prevented at the planning and design stage? This study takes up the power-grid side of that question: when a large data center load is connected, can the existing grid stay within its limits and keep a margin? Other issues, such as noise, are outside its scope.

#### (2) Stage 1 overview 인트로

4절 문단을 쓴다. Q2(첫 계산 결과를 어떻게 받아들였는지)는 연구자가 공부한 뒤 보충하므로, 지금은 해당 문장을 넣지 않는다.

#### (3) 네 설정 비교(P0Q0~P1Q1) 섹션 인트로 — Q3 기반

**한국어**
> 처음에 내가 정한 것은 데이터센터를 연결하는 단순한 상황 하나였다. 운전 설정값을 여러 가지로 두고 비교해 보자는 것은 ChatGPT의 의견이었고, 나는 이를 받아들여 함께 비교 방법을 정했다. 그 결과 reference source의 P 설계 범위와 Q 설계 범위를 각각, 또 함께 바꾼 네 설정(P0Q0, P1Q0, P0Q1, P1Q1)을 만들고, 각각을 95, 100, 105 MW에서 평가했다. 계산과 코드는 Claude Code가 수행했다.

**English**
> At first, all I set up was a simple scenario: connecting a data center. Comparing several operating settings was ChatGPT's suggestion; I accepted it and worked out the comparison together with it. The result was four settings (P0Q0, P1Q0, P0Q1, P1Q1) that change the reference source's P design range and Q design range separately and together, each evaluated at 95, 100 and 105 MW. Claude Code carried out the calculations and wrote the code.

추가 예정: Q4 답(결과를 보고 이해한 것)을 받으면 이 인트로 끝에 한두 문장을 붙인다.

---

## 4. 1단계가 그렇게 진행된 이유 (확인된 문단)

`What Stage 1 Does Not Show` 섹션 앞이나 Stage 1 개요에 쓴다.

**한국어**
> 원래 목표는 단일 설비 사고(N-1)까지 고려한 데이터센터 hosting capacity 연구였다. 그러나 첫 계산에서 기준 계통이 데이터센터 없이도 정상 상태의 physical limit을 넘었기 때문에, Stage 1에서는 먼저 정상 상태에서 limit과 margin을 지키는 운전 설정을 확보하고 평가했다. Stage 1이 보이지 못한 N-1 security, hosting capacity, 다른 위치 비교는 이후 단계의 연구 질문이 되었다.

**English**
> The original goal was a data center hosting study that includes single-contingency (N-1) security. The first calculations showed that the base network violated normal-operation limits even without the data center, so Stage 1 first established and evaluated operating settings that respect limits and margins under normal conditions. What Stage 1 does not show (N-1 security, hosting capacity, other locations) became the research questions for the later stages.

주의: "공부하기 쉽도록 일부러 검사를 뺐다"거나 "안정성(stability) 검사를 배제했다"는 표현은 쓰지 않는다. 실제 진행과 다르고, stability는 처음부터 범위 밖이었다.
