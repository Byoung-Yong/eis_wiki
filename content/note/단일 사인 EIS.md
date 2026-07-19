---
id: EIS_SINGLE_SINE
title: 단일 사인 EIS
title_en: Single-sine EIS
type: MeasurementMethod
domain: measurement
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Single-sine EIS
tags:
- EIS
- measurement
- MeasurementMethod
relations:
- type: PART_OF
  target: MOC_MEASUREMENT
  confidence: 1
- type: USES
  target: EIS_SINUSOID
  confidence: 1
- type: AFFECTS
  target: EIS_ACQUISITION_TIME
  confidence: 1
- type: DEPENDS_ON
  target: EIS_FREQUENCY_ORDER
  confidence: 1
language: ko
---

# 단일 사인 EIS (Single-sine EIS)

## 핵심 정의

한 번에 하나의 주파수 사인파를 순차적으로 가하는 측정 방식이다.

## 개념 이해

각 주파수에서 정상상태 응답을 직접 추정할 수 있지만 저주파를 포함하면 전체 시간이 길어진다.

## EIS에서의 역할

전통적인 주파수 주사 방식의 EIS의 기본 방식이다.

## 성립 조건과 실험 해석

주파수 순서와 시스템 변화가 결합되지 않는지 확인해야 한다.

## 한계와 흔한 오해

순차 측정으로 얻은 매끄러운 스펙트럼이 반드시 하나의 동일 상태를 뜻하지 않는다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **사용** → [[사인파 자극]]
- **영향** → [[EIS 측정 시간]]
- **의존** → [[주파수 측정 순서 효과]]
