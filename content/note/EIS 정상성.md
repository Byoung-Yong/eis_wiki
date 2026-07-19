---
id: EIS_STATIONARITY
title: EIS 정상성
title_en: EIS stationarity
type: ValidationCriterion
domain: validation
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS stationarity
tags:
- EIS
- validation
- ValidationCriterion
relations:
- type: PART_OF
  target: MOC_VALIDATION
  confidence: 1
- type: RELATED_TO
  target: EIS_LTI_SYSTEM
  confidence: 1
- type: TESTED_BY
  target: EIS_REPEATABILITY
  confidence: 1
language: ko
---

# EIS 정상성 (EIS stationarity)

## 핵심 정의

측정 동안 시스템의 응답 특성이 시간에 따라 의미 있게 변하지 않는 성질이다.

## 개념 이해

순차 EIS에서는 서로 다른 주파수 점이 같은 상태의 전달함수를 대표하도록 요구된다.

## EIS에서의 역할

고전적 스펙트럼 조립과 KK 적용의 핵심 조건이다.

## 성립 조건과 실험 해석

반복, 정방향·역방향 주사, 원시 신호 드리프트 및 시간분해 측정으로 평가한다.

## 한계와 흔한 오해

매끄러운 스펙트럼이 정상성을 보장하지 않는다.

## 관련 개념

- **상위 영역** → [[검증과 측정 왜곡]]
- **관련** → [[선형 시불변 시스템]]
- **검사됨** → [[반복 측정]]
