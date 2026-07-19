---
id: EIS_GALVANOSTATIC
title: 전류 제어 EIS
title_en: Galvanostatic EIS
type: MeasurementMethod
domain: measurement
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Galvanostatic EIS
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
  target: EIS_GALVANOSTAT
  confidence: 1
- type: PROBES
  target: EIS_VOLTAGE_RESPONSE
  confidence: 1
language: ko
---

# 전류 제어 EIS (Galvanostatic EIS)

## 핵심 정의

작동점 주변에 교류 전류를 가하고 전압 응답을 측정하는 EIS 방식이다.

## 개념 이해

낮은 임피던스 장치나 배터리 등에서 안정적인 전류 자극이 유리할 수 있다.

## 핵심 정량 관계

$
Z(\omega)=\tilde V/\tilde I
$

## EIS에서의 역할

전류 자극에 대한 전압 전달 특성을 얻는다.

## 성립 조건과 실험 해석

전압 응답이 장비 출력 한계와 시스템 허용 범위 안에 있어야 한다.

## 한계와 흔한 오해

전위 제어 방식과 수학적으로 같더라도 실제 계측 오차와 자극 제한은 다를 수 있다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[전기화학 임피던스 분광법]]
- **사용** → [[정전류기]]
- **PROBES** → [[교류 전압 응답]]
