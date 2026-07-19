---
id: EIS_MODEL_IDENTIFIABILITY
title: EIS 모델 식별가능성
title_en: EIS model identifiability
type: AnalysisConcept
domain: analysis
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS model identifiability
tags:
- EIS
- analysis
- AnalysisConcept
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: HAS_COMPONENT
  target: EIS_STRUCTURAL_IDENTIFIABILITY
  confidence: 1
- type: HAS_COMPONENT
  target: EIS_PRACTICAL_IDENTIFIABILITY
  confidence: 1
- type: RELATED_TO
  target: EIS_TOPOLOGY_NONUNIQUENESS
  confidence: 1
language: ko
---

# EIS 모델 식별가능성 (EIS model identifiability)

## 핵심 정의

임피던스 데이터가 모델 구조와 매개변수를 구별할 수 있는 정도이다.

## 개념 이해

구조적, 실용적, 구조 수준의 비고유성을 함께 포함하는 상위 개념이다.

## EIS에서의 역할

해석 가능한 매개변수와 구별 불가능한 대안을 구분한다.

## 성립 조건과 실험 해석

데이터 범위, 잡음, 섭동 계열과 사전분포 정보를 고려한다.

## 한계와 흔한 오해

한 스펙트럼에서 식별 불가능한 모델이 여러 조건의 공동 적합에서는 개선될 수 있다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **구성** → [[구조적 식별가능성]]
- **구성** → [[실용적 식별가능성]]
- **관련** → [[회로 구조의 비고유성]]
