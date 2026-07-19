---
id: EIS_CPE_EFFECTIVE_CAPACITANCE
title: CPE 유효 정전용량
title_en: Effective capacitance of a CPE
type: ModelParameter
domain: elements
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Effective capacitance of a CPE
tags:
- EIS
- elements
- ModelParameter
relations:
- type: PART_OF
  target: MOC_ELEMENTS
  confidence: 1
- type: CALCULATED_FROM
  target: EIS_CPE
  confidence: 1
- type: DEPENDS_ON
  target: EIS_CIRCUIT_TOPOLOGY
  confidence: 1
language: ko
---

# CPE 유효 정전용량 (Effective capacitance of a CPE)

## 핵심 정의

특정 회로 구조와 특성 주파수를 이용해 CPE의 $Q,\alpha$를 정전용량 규모로 변환한 값이다.

## 개념 이해

변환식은 CPE가 어떤 저항과 어떻게 연결되는지에 따라 달라진다.

## 핵심 정량 관계

$
C_{eff}=f(Q,\alpha,R,\text{구조})
$

## EIS에서의 역할

서로 다른 CPE 적합 결과를 물리적 정전용량과 비교할 때 사용된다.

## 성립 조건과 실험 해석

사용한 변환식과 회로 구조를 명시해야 한다.

## 한계와 흔한 오해

모든 CPE에 보편적인 단일 정전용량 변환식은 없다.

## 관련 개념

- **상위 영역** → [[회로 요소]]
- **계산됨** → [[상수 위상 요소]]
- **의존** → [[회로 구조]]
