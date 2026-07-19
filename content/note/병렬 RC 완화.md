---
id: EIS_PARALLEL_RC
title: 병렬 RC 완화
title_en: Parallel RC relaxation
type: CircuitElement
domain: elements
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Voigt element
- Parallel RC relaxation
tags:
- EIS
- elements
- CircuitElement
relations:
- type: PART_OF
  target: MOC_ELEMENTS
  confidence: 1
- type: RELATED_TO
  target: EIS_RESISTOR
  confidence: 1
- type: RELATED_TO
  target: EIS_CAPACITOR
  confidence: 1
- type: ESTIMATED_BY
  target: EIS_TIME_CONSTANT
  confidence: 1
language: ko
---

# 병렬 RC 완화 (Parallel RC relaxation)

## 핵심 정의

저항과 정전용량을 병렬로 연결한 하나의 이상적 완화 요소이다.

## 개념 이해

나이퀴스트에서 직경 $R$의 반원을 만들고 최대 허수부는 $\omega RC=1$에서 나타난다.

## 핵심 정량 관계

$
Z=R/(1+j\omega RC)
$

## EIS에서의 역할

단일 시간상수 계면 과정의 기본 모델이다.

## 성립 조건과 실험 해석

이상적 반원과 단일 시간상수를 가정한다.

## 한계와 흔한 오해

반원의 존재만으로 저항과 정전용량의 물리적 정체가 유일하게 정해지지 않는다.

## 관련 개념

- **상위 영역** → [[회로 요소]]
- **관련** → [[이상적 저항기]]
- **관련** → [[이상적 축전기]]
- **추정_BY** → [[시간상수]]
