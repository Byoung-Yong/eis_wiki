---
id: EIS_DRT_KERNEL
title: DRT 커널 함수
title_en: DRT kernel
type: MathematicalObject
domain: analysis
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- DRT kernel
tags:
- EIS
- analysis
- MathematicalObject
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: RELATED_TO
  target: EIS_DRT
  confidence: 1
language: ko
---

# DRT 커널 함수 (DRT kernel)

## 핵심 정의

완화 시간 $\tau$의 단위 기여가 주파수 응답에 어떻게 나타나는지 정의하는 적분 커널 함수가다.

## 개념 이해

표준 RC 커널 함수 외에 유도성, 확산 또는 일반화 커널 함수를 사용할 수 있다.

## 핵심 정량 관계

$
K(\omega,\tau)=1/(1+j\omega\tau)
$

## EIS에서의 역할

DRT 역산의 순방향 모델을 정의한다.

## 성립 조건과 실험 해석

커널 함수 선택은 복원 가능한 과정 종류와 기준선을 결정한다.

## 한계와 흔한 오해

커널 함수가 잘못되면 정칙화가 안정된 듯 보여도 해석이 편향될 수 있다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **관련** → [[완화 시간 분포]]
