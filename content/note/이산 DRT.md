---
id: EIS_DISCRETE_DRT
title: 이산 DRT
title_en: Discrete DRT
type: AnalysisMethod
domain: analysis
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Discrete DRT
tags:
- EIS
- analysis
- AnalysisMethod
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: USES
  target: EIS_DRT_KERNEL
  confidence: 1
- type: ESTIMATED_BY
  target: EIS_TIKHONOV_REGULARIZATION
  confidence: 1
language: ko
---

# 이산 DRT (Discrete DRT)

## 핵심 정의

연속 DRT 적분을 유한한 기저와 시간상수 격자로 근사한 선형 역문제이다.

## 개념 이해

행렬 커널 함수와 비음수 또는 무제약 계수를 사용해 수치적으로 분포를 추정한다.

## 핵심 정량 관계

$
\mathbf z\approx\mathbf K\boldsymbol\gamma
$

## EIS에서의 역할

대부분의 실용적 DRT 알고리즘의 계산 형태이다.

## 성립 조건과 실험 해석

격자 범위와 밀도, 기저 폭 및 제약조건을 설정해야 한다.

## 한계와 흔한 오해

격자를 매우 촘촘히 한다고 실제 해상도가 무한히 증가하지 않는다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **사용** → [[DRT 커널 함수]]
- **추정_BY** → [[티호노프 정칙화]]
