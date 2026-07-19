---
id: EIS_WEIGHTING
title: EIS 잔차 가중
title_en: EIS residual weighting
type: AnalysisMethod
domain: analysis
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS 잔차 weighting
- EIS residual weighting
tags:
- EIS
- analysis
- AnalysisMethod
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: RELATED_TO
  target: EIS_CNLS
  confidence: 1
- type: ACCOUNTS_FOR
  target: EIS_NOISE
  confidence: 1
language: ko
---

# EIS 잔차 가중 (EIS residual weighting)

## 핵심 정의

주파수 및 복소 성분별 잔차가 목적함수에 기여하는 상대적 크기를 정하는 규칙이다.

## 개념 이해

절대 오차, 임피던스 크기, 비례 오차, 추정 분산 등 선택에 따라 적합이 강조하는 영역이 달라진다.

## 핵심 정량 관계

$
\chi^2=\sum_k w_k|r_k|^2
$

## EIS에서의 역할

이분산 EIS 잡음을 반영하고 특정 영역의 과도한 지배를 막는다.

## 성립 조건과 실험 해석

가중치의 물리적·통계적 근거를 보고해야 한다.

## 한계와 흔한 오해

작은 잔차를 얻기 위해 임의 가중을 선택하면 매개변수 비교가 왜곡될 수 있다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **관련** → [[복소 비선형 최소제곱법]]
- **반영** → [[EIS 잡음]]
