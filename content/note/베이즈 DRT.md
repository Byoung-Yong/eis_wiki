---
id: EIS_BAYESIAN_DRT
title: 베이즈 DRT
title_en: Bayesian DRT
type: AnalysisMethod
domain: analysis
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Bayesian DRT
- 베이지안 DRT
tags:
- EIS
- analysis
- AnalysisMethod
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: IS_A
  target: EIS_DRT
  confidence: 1
- type: CHARACTERIZES
  target: EIS_DRT_UNCERTAINTY
  confidence: 1
language: ko
---

# 베이즈 DRT (Bayesian DRT)

## 핵심 정의

DRT 함수와 잡음에 확률적 사전분포를 두고 사후분포를 추정하는 방법이다.

## 개념 이해

점추정값뿐 아니라 피크와 분포의 불확실성 및 상관을 제공한다.

## EIS에서의 역할

정칙화 매개변수 불확실성과 베이즈 신용대 분석에 사용된다.

## 성립 조건과 실험 해석

사전 커널 함수, 초매개변수, 우도와 표본추출 또는 근사법을 보고해야 한다.

## 한계와 흔한 오해

베이즈 신용대가 모델–커널 함수 불일치를 자동 포함하는 것은 아니다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **종류** → [[완화 시간 분포]]
- **특성화** → [[DRT 불확실성]]
