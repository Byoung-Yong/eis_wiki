---
id: EIS_FOUR_ELECTRODE
title: 4전극 EIS
title_en: Four-electrode EIS
type: MeasurementConfiguration
domain: measurement
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Four-electrode EIS
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
- type: REDUCES_CONTRIBUTION_OF
  target: EIS_CONTACT_RESISTANCE
  confidence: 1
language: ko
---

# 4전극 EIS (Four-electrode EIS)

## 핵심 정의

전류 인가 전극과 전압 감지 전극을 분리한 구성이다.

## 개념 이해

시료 내부 또는 전해질의 전도도를 접촉 저항 영향에서 분리하는 데 유리하다.

## EIS에서의 역할

막, 전해질, 고체 이온전도체 측정에 사용된다.

## 성립 조건과 실험 해석

전압 감지 입력의 임피던스와 기하학적 셀 상수를 알아야 한다.

## 한계와 흔한 오해

4전극 구성도 시료 불균일성과 가장자리 전기장을 자동 제거하지 않는다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[EIS 셀 구성]]
- **측정 기여 감소** → [[접촉 저항]]
