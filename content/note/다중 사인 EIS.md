---
id: EIS_MULTISINE
title: 다중 사인 EIS
title_en: Multisine EIS
type: MeasurementMethod
domain: measurement
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Multisine EIS
tags:
- EIS
- measurement
- MeasurementMethod
relations:
- type: PART_OF
  target: MOC_MEASUREMENT
  confidence: 1
- type: IS_A
  target: EIS_BROADBAND_EXCITATION
  confidence: 1
- type: DECREASES
  target: EIS_ACQUISITION_TIME
  confidence: 1
- type: DEPENDS_ON
  target: EIS_SPECTRAL_LEAKAGE
  confidence: 1
language: ko
---

# 다중 사인 EIS (Multisine EIS)

## 핵심 정의

여러 주파수 성분을 동시에 포함한 파형으로 임피던스를 추정하는 방식이다.

## 개념 이해

측정 시간을 줄이고 비선형 왜곡을 구분할 수 있지만 파형 설계, 파고율, 누설 및 주파수 배치가 중요하다.

## 핵심 정량 관계

$
x(t)=\sum_k A_k\sin(\omega_k t+\phi_k)
$

## EIS에서의 역할

빠른 EIS와 시간분해 측정에 사용된다.

## 성립 조건과 실험 해석

선택 주파수가 관측 창에서 정수 주기를 이루도록 설계하는 경우가 많다.

## 한계와 흔한 오해

동시 측정이 자동으로 비선형성이나 비정상성을 제거하지 않는다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[광대역 자극]]
- **DECREASES** → [[EIS 측정 시간]]
- **의존** → [[스펙트럼 누설]]
