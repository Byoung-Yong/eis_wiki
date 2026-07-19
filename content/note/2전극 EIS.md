---
id: EIS_TWO_ELECTRODE
title: 2전극 EIS
title_en: Two-electrode EIS
type: MeasurementConfiguration
domain: measurement
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Two-electrode EIS
tags:
- EIS
- measurement
- MeasurementConfiguration
relations:
- type: PART_OF
  target: MOC_MEASUREMENT
  confidence: 1
- type: IS_A
  target: EIS_CELL_CONFIGURATION
  confidence: 1
- type: COUPLED_TO
  target: EIS_WORKING_ELECTRODE
  confidence: 1
- type: COUPLED_TO
  target: EIS_COUNTER_ELECTRODE
  confidence: 1
language: ko
---

# 2전극 EIS (Two-electrode EIS)

## 핵심 정의

같은 두 전극이 전류 전달과 전압 측정을 담당하는 셀 구성이다.

## 개념 이해

측정 임피던스에는 두 전극과 전해질의 기여가 모두 포함된다.

## EIS에서의 역할

완전 셀, 대칭 셀, 고체 시료 측정에 흔히 사용된다.

## 성립 조건과 실험 해석

어느 전극이 응답을 지배하는지 독립적으로 분리하기 어렵다.

## 한계와 흔한 오해

한 전극의 매개변수로 해석하려면 대칭성 또는 별도 근거가 필요하다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[EIS 셀 구성]]
- **결합** → [[작업 전극]]
- **결합** → [[상대 전극]]
