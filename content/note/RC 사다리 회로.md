---
id: EIS_RC_LADDER
title: RC 사다리 회로
title_en: RC ladder
type: CircuitModel
domain: elements
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- RC ladder
tags:
- EIS
- elements
- CircuitModel
relations:
- type: PART_OF
  target: MOC_ELEMENTS
  confidence: 1
- type: RELATED_TO
  target: EIS_DRT
  confidence: 1
- type: VALIDATED_BY
  target: EIS_BAND_DELETION
  confidence: 1
- type: RELATED_TO
  target: EIS_OVERPARAMETERIZATION
  confidence: 1
language: ko
---

# RC 사다리 회로 (RC ladder)

## 핵심 정의

여러 RC 완화 요소를 직렬 또는 병렬 구조로 배열한 이산 분포 모델이다.

## 개념 이해

연속 DRT를 유한한 시간상수 격자로 근사하며 유연한 스펙트럼 표현이 가능하다.

## 핵심 정량 관계

$
Z=R_\infty+\sum_k g_k/(1+j\omega\tau_k)
$

## EIS에서의 역할

DRT 기반 회로화, 정칙화된 적합 및 데이터 표현에 사용된다.

## 성립 조건과 실험 해석

요소 수와 시간상수 격자는 검증으로 선택해야 한다.

## 한계와 흔한 오해

많은 요소가 잘 맞는다고 각 RC가 독립적인 물리 과정이라는 뜻은 아니다.

## 관련 개념

- **상위 영역** → [[회로 요소]]
- **관련** → [[완화 시간 분포]]
- **검증됨** → [[주파수 대역 삭제 검증]]
- **관련** → [[과도한 매개변수화]]
