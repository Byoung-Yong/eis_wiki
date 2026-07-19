---
id: EIS_R_CPE_MODEL
title: R–CPE 모델
title_en: R-CPE model
type: CircuitModel
domain: models
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- R-CPE model
tags:
- EIS
- models
- CircuitModel
relations:
- type: PART_OF
  target: MOC_MODELS
  confidence: 1
- type: IS_A
  target: EIS_EQUIVALENT_CIRCUIT
  confidence: 1
- type: USES
  target: EIS_CPE
  confidence: 1
- type: RELATED_TO
  target: EIS_PARALLEL_RC
  confidence: 1
language: ko
---

# R–CPE 모델 (R-CPE model)

## 핵심 정의

저항과 CPE를 병렬 연결하여 눌린 호를 표현하는 모델이다.

## 개념 이해

이상적 RC보다 적은 매개변수로 넓은 분포 응답을 근사하지만 물리적 원인은 추가 근거가 필요하다.

## 핵심 정량 관계

$
Z=[1/R+Q(j\omega)^\alpha]^{-1}
$

## EIS에서의 역할

비이상적 계면 및 도막 응답 적합에 널리 쓰인다.

## 성립 조건과 실험 해석

CPE 계수와 지수의 상관 및 주파수 범위 의존성을 평가해야 한다.

## 한계와 흔한 오해

R–CPE 적합의 성공이 표면 거칠기 기작을 증명하지 않는다.

## 관련 개념

- **상위 영역** → [[등가회로와 물리 모델]]
- **종류** → [[등가회로 모델]]
- **사용** → [[상수 위상 요소]]
- **관련** → [[병렬 RC 완화]]
