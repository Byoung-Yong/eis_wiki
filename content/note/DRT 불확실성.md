---
id: EIS_DRT_UNCERTAINTY
title: DRT 불확실성
title_en: DRT uncertainty
type: AnalysisOutput
domain: analysis
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- DRT uncertainty
tags:
- EIS
- analysis
- AnalysisOutput
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: ESTIMATED_BY
  target: EIS_BAYESIAN_DRT
  confidence: 1
- type: DEPENDS_ON
  target: EIS_DRT_RESOLUTION
  confidence: 1
language: ko
---

# DRT 불확실성 (DRT uncertainty)

## 핵심 정의

잡음, 유한 대역폭, 정칙화와 초매개변수에 따른 DRT 함수와 피크의 불확실성이다.

## 개념 이해

베이즈 신용대, 부트스트랩, 섭동 민감도 또는 해상도 행렬로 표현할 수 있다.

## EIS에서의 역할

피크 존재와 이동의 신뢰도를 평가한다.

## 성립 조건과 실험 해석

점별 구간과 피크 수준 불확실성을 구분해야 한다.

## 한계와 흔한 오해

한 개의 매끄러운 곡선만 제시하면 역산 불확실성이 숨겨질 수 있다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **추정_BY** → [[베이즈 DRT]]
- **의존** → [[DRT 해상도]]
