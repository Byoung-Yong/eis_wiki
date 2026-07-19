---
id: EIS_DRT_BOUNDARY_EFFECT
title: DRT 경계 효과
title_en: DRT boundary effect
type: Artifact
domain: analysis
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- DRT boundary effect
tags:
- EIS
- analysis
- Artifact
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: RELATED_TO
  target: EIS_FINITE_BANDWIDTH
  confidence: 1
- type: AFFECTS
  target: EIS_DRT_PLOT
  confidence: 1
language: ko
---

# DRT 경계 효과 (DRT boundary effect)

## 핵심 정의

측정 주파수 범위 바깥의 과정이나 절단된 꼬리가 DRT 시간상수 범위의 가장자리에 인공 피크 또는 왜곡을 만드는 현상이다.

## 개념 이해

역산이 관측되지 않은 응답을 제한된 기저 안에 배분하면서 발생한다.

## EIS에서의 역할

DRT 경계 피크와 매우 빠르거나 느린 과정의 해석에 중요하다.

## 성립 조건과 실험 해석

시간상수 범위와 주파수 범위를 바꾸어 민감도를 확인한다.

## 한계와 흔한 오해

경계 피크를 실제 독립 과정으로 쉽게 오인할 수 있다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **관련** → [[유한 주파수 대역]]
- **영향** → [[DRT 선도]]
