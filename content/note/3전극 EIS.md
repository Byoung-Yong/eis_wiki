---
id: EIS_THREE_ELECTRODE
title: 3전극 EIS
title_en: Three-electrode EIS
type: MeasurementConfiguration
domain: measurement
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Three-electrode EIS
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
- type: USES
  target: EIS_REFERENCE_ELECTRODE
  confidence: 1
- type: DEPENDS_ON
  target: EIS_REFERENCE_PLACEMENT
  confidence: 1
language: ko
---

# 3전극 EIS (Three-electrode EIS)

## 핵심 정의

작업 전극, 상대 전극, 기준 전극을 분리한 셀 구성이다.

## 개념 이해

기준 전극은 거의 전류를 흘리지 않고 작업 전극 전위를 감지하여 특정 전극의 응답을 분리하려 한다.

## EIS에서의 역할

반쪽전지 및 전극별 분석에 사용된다.

## 성립 조건과 실험 해석

기준 전극 위치와 전류 분포가 고주파 응답을 왜곡할 수 있다.

## 한계와 흔한 오해

3전극 구성이 항상 완벽한 전극 분리를 보장하지 않는다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[EIS 셀 구성]]
- **사용** → [[기준 전극]]
- **의존** → [[기준 전극 위치]]
