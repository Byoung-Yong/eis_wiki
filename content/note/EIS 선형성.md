---
id: EIS_LINEARITY
title: EIS 선형성
title_en: EIS linearity
type: ValidationCriterion
domain: validation
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS linearity
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
  target: EIS_AMPLITUDE_TEST
  confidence: 1
language: ko
---

# EIS 선형성 (EIS linearity)

## 핵심 정의

자극의 중첩과 비례 관계가 측정 범위에서 성립하는 성질이다.

## 개념 이해

선형 조건에서는 응답이 입력과 같은 주파수에 나타나며 임피던스가 자극 진폭과 무관하다.

## EIS에서의 역할

소신호 EIS와 주파수별 독립 분석의 전제이다.

## 성립 조건과 실험 해석

진폭 주사, 고조파 분석 또는 다중 사인 왜곡 분석으로 평가한다.

## 한계와 흔한 오해

KK 일치만으로 선형성이 완전히 증명되지는 않는다.

## 관련 개념

- **상위 영역** → [[검증과 측정 왜곡]]
- **관련** → [[선형 시불변 시스템]]
- **검사됨** → [[진폭 의존성 검사]]
