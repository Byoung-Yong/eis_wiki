---
id: EIS_DRT_REGULARIZATION
title: DRT 정칙화
title_en: DRT regularization
type: AnalysisMethod
domain: analysis
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- DRT 정규화
- DRT regularization
- DRT 규제화
tags:
- EIS
- analysis
- AnalysisMethod
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: RELATED_TO
  target: EIS_DRT
  confidence: 1
- type: HAS_COMPONENT
  target: EIS_TIKHONOV_REGULARIZATION
  confidence: 1
- type: AFFECTS
  target: EIS_DRT_RESOLUTION
  confidence: 1
language: ko
---

# DRT 정칙화 (DRT regularization)

## 핵심 정의

비정칙 DRT 역문제에서 잡음 증폭과 해의 요동을 제한하는 추가 벌점 또는 사전분포가다.

## 개념 이해

평활성, 희소성, 가우스 과정 또는 베이즈 사전분포가 해상도와 안정성의 절충을 정한다.

## 핵심 정량 관계

$
\min_\gamma\|K\gamma-z\|^2+\lambda\|L\gamma\|^2
$

## EIS에서의 역할

안정적인 DRT 복원에 필수적이다.

## 성립 조건과 실험 해석

$\lambda$, 벌점의 차수, 비음수성과 선택 기준을 보고해야 한다.

## 한계와 흔한 오해

매끄러운 DRT가 실제 과정 분포를 정확히 재현한다는 뜻은 아니다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **관련** → [[완화 시간 분포]]
- **구성** → [[티호노프 정칙화]]
- **영향** → [[DRT 해상도]]
