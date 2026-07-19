---
id: EIS_NOISE
title: EIS 잡음
title_en: EIS noise
type: Artifact
domain: validation
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS noise
tags:
- EIS
- validation
- Artifact
relations:
- type: PART_OF
  target: MOC_VALIDATION
  confidence: 1
- type: DEPENDS_ON
  target: EIS_CYCLES_INTEGRATION
  confidence: 1
- type: AFFECTS
  target: EIS_DRT_RESOLUTION
  confidence: 1
- type: REPRESENTED_BY
  target: EIS_WEIGHTING
  confidence: 1
language: ko
---

# EIS 잡음 (EIS noise)

## 핵심 정의

전압·전류 신호 및 계산된 임피던스에 포함되는 무작위 또는 상관된 변동이다.

## 개념 이해

잡음 수준은 주파수, 범위, 진폭, 평균 시간과 시료 임피던스에 따라 달라진다.

## EIS에서의 역할

가중, 불확실성, DRT 정칙화와 주파수 선택에 영향을 준다.

## 성립 조건과 실험 해석

실수·허수 공분산과 이분산성을 고려할 수 있다.

## 한계와 흔한 오해

모든 잔차를 독립·동일분산 가우스 잡음으로 가정하면 편향될 수 있다.

## 관련 개념

- **상위 영역** → [[검증과 측정 왜곡]]
- **의존** → [[주기 수와 적분 시간]]
- **영향** → [[DRT 해상도]]
- **표현됨** → [[EIS 잔차 가중]]
