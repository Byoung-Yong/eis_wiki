---
id: EIS_CPE_EXPONENT
title: CPE 지수
title_en: CPE exponent
type: ModelParameter
domain: elements
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- CPE exponent
tags:
- EIS
- elements
- ModelParameter
relations:
- type: PART_OF
  target: MOC_ELEMENTS
  confidence: 1
- type: APPEARS_IN
  target: EIS_CPE
  confidence: 1
- type: AFFECTS
  target: EIS_CPE_EFFECTIVE_CAPACITANCE
  confidence: 1
language: ko
---

# CPE 지수 (CPE exponent)

## 핵심 정의

상수 위상 요소의 주파수 기울기와 위상을 결정하는 무차원 지수이다.

## 개념 이해

$\alpha$가 1에서 멀어질수록 이상적 축전기로부터의 분산이 커진다.

## 핵심 정량 관계

$
\phi_{CPE}=-\alpha\pi/2
$

## EIS에서의 역할

CPE 응답의 비이상성 정도를 기술한다.

## 성립 조건과 실험 해석

값은 적합 범위, 구조 및 다른 매개변수와 상관될 수 있다.

## 한계와 흔한 오해

$\alpha$를 곧바로 표면 거칠기 차원으로 해석하는 것은 일반적으로 정당화되지 않는다.

## 관련 개념

- **상위 영역** → [[회로 요소]]
- **APPEARS_IN** → [[상수 위상 요소]]
- **영향** → [[CPE 유효 정전용량]]
