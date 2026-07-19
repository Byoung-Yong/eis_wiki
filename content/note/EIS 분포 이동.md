---
id: EIS_DOMAIN_SHIFT
title: EIS 분포 이동
title_en: EIS domain shift
type: Limitation
domain: analysis
status: core-reviewed
review_level: core-reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS domain shift
tags:
- EIS
- analysis
- Limitation
relations:
- type: PART_OF
  target: MOC_ANALYSIS
  confidence: 1
- type: AFFECTS
  target: EIS_MACHINE_LEARNING
  confidence: 1
- type: VALIDATED_BY
  target: EIS_OOD_DETECTION
  confidence: 1
language: ko
---

# EIS 분포 이동 (EIS domain shift)

## 핵심 정의

학습 데이터와 실제 적용 데이터의 재료, 장비, 온도, 주파수 격자 또는 잡음 분포가 달라지는 현상이다.

## 개념 이해

모델이 학습 범위 안에서 높았던 성능을 새로운 셀·실험실·조건에서 잃게 한다.

## EIS에서의 역할

EIS 기계 학습의 외부 일반화 한계를 설명한다.

## 성립 조건과 실험 해석

외부 조건 시험과 메타데이터 기반 층화가 필요하다.

## 한계와 흔한 오해

무작위 학습·시험 분할만으로 실제 분포 간 전이를 평가하기 어렵다.

## 관련 개념

- **상위 영역** → [[분석과 역문제]]
- **영향** → [[EIS 기계 학습]]
- **검증됨** → [[분포 외 탐지]]
