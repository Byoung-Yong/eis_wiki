---
id: EIS_DRT_PLOT
title: DRT 선도
title_en: DRT plot
type: DataRepresentation
domain: representations
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- DRT plot
tags:
- EIS
- representations
- DataRepresentation
relations:
- type: PART_OF
  target: MOC_REPRESENTATIONS
  confidence: 1
- type: RELATED_TO
  target: EIS_DRT
  confidence: 1
- type: DEPENDS_ON
  target: EIS_DRT_REGULARIZATION
  confidence: 1
language: ko
---

# DRT 선도 (DRT plot)

## 핵심 정의

완화 시간 또는 로그 시간상수에 대한 분포 함수의 크기를 표시한 그래프이다.

## 개념 이해

서로 겹친 임피던스 특징을 시간척도 축에서 탐색하지만 결과는 역산 설정에 의존한다.

## 핵심 정량 관계

$
\gamma(\ln\tau)\;\text{vs.}\;\ln\tau
$

## EIS에서의 역할

DRT 피크 위치, 폭, 면적 및 불확실성을 시각화한다.

## 성립 조건과 실험 해석

축 정의와 정규화, 커널 함수, 정칙화를 함께 보고해야 한다.

## 한계와 흔한 오해

피크 수를 회로 요소 수 또는 기작 수로 그대로 읽으면 안 된다.

## 관련 개념

- **상위 영역** → [[데이터 표현]]
- **관련** → [[완화 시간 분포]]
- **의존** → [[DRT 정칙화]]
