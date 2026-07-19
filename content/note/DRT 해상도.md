---
id: EIS_DRT_RESOLUTION
title: DRT 해상도
title_en: DRT resolution
type: AnalysisConcept
domain: analysis
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- DRT resolution
tags:
- EIS
- analysis
- AnalysisConcept
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: LIMITED_BY
  target: EIS_FINITE_BANDWIDTH
  confidence: 1
- type: LIMITED_BY
  target: EIS_NOISE
  confidence: 1
- type: DEPENDS_ON
  target: EIS_DRT_REGULARIZATION
  confidence: 1
language: ko
---

# DRT 해상도 (DRT resolution)

## 핵심 정의

서로 가까운 완화 시간 기여를 구별하고 피크 위치·폭을 복원할 수 있는 능력이다.

## 개념 이해

대역폭, 표본추출, 잡음, 커널 함수, 기저와 정칙화가 공동으로 결정한다.

## EIS에서의 역할

DRT 피크 수와 변화 해석의 한계를 정한다.

## 성립 조건과 실험 해석

합성 데이터 복원과 민감도 시험으로 평가한다.

## 한계와 흔한 오해

격자 간격을 줄이는 것과 실제 해상도 향상은 다르다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **제한** → [[유한 주파수 대역]]
- **제한** → [[EIS 잡음]]
- **의존** → [[DRT 정칙화]]
