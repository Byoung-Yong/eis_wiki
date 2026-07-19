---
id: EIS_POTENTIOSTATIC
title: 전위 제어 EIS
title_en: Potentiostatic EIS
type: MeasurementMethod
domain: measurement
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Potentiostatic EIS
tags:
- EIS
- measurement
- MeasurementMethod
relations:
- type: PART_OF
  target: MOC_MEASUREMENT
  confidence: 1
- type: IS_A
  target: EIS_ELECTROCHEMICAL_IMPEDANCE_SPECTROSCOPY
  confidence: 1
- type: USES
  target: EIS_POTENTIOSTAT
  confidence: 1
- type: PROBES
  target: EIS_CURRENT_RESPONSE
  confidence: 1
language: ko
---

# 전위 제어 EIS (Potentiostatic EIS)

## 핵심 정의

작동점 주변에 교류 전압을 가하고 전류 응답을 측정하는 EIS 방식이다.

## 개념 이해

전위차계가 전극 전위를 제어하며 대부분의 액상 전기화학 실험에서 널리 사용된다.

## 핵심 정량 관계

$
Z(\omega)=\tilde V/\tilde I
$

## EIS에서의 역할

전압 자극에 대한 전류 전달 특성을 얻는다.

## 성립 조건과 실험 해석

전류 응답이 장비 범위와 안정성 한계 안에 있어야 한다.

## 한계와 흔한 오해

전위가 제어된다고 실제 전극 표면 전체가 항상 균일한 전위를 갖는 것은 아니다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[전기화학 임피던스 분광법]]
- **사용** → [[정전위기]]
- **PROBES** → [[교류 전류 응답]]
