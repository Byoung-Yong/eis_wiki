---
id: EIS_OUTLIER
title: EIS 이상치
title_en: EIS outlier
type: Artifact
domain: validation
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- EIS 이상점
- EIS outlier
tags:
- EIS
- validation
- Artifact
relations:
- type: PART_OF
  target: MOC_VALIDATION
  confidence: 1
- type: VALIDATED_BY
  target: EIS_RESIDUAL_ANALYSIS
  confidence: 1
- type: RESULTS_FROM
  target: EIS_RANGE_SWITCHING
  confidence: 1
language: ko
---

# EIS 이상치 (EIS outlier)

## 핵심 정의

주변 주파수 추세와 예상 불확실성에서 벗어난 개별 또는 소수 측정점이다.

## 개념 이해

접촉 순간 변화, 범위 전환, 외부 간섭, 계산 실패 또는 실제 과도응답로 발생할 수 있다.

## EIS에서의 역할

잔차와 원시 신호를 함께 보고 원인을 판정한다.

## 성립 조건과 실험 해석

삭제 기준을 사전에 정의하고 기록해야 한다.

## 한계와 흔한 오해

모양이 이상하다는 이유만으로 임의 삭제하면 분석 편향이 생긴다.

## 관련 개념

- **상위 영역** → [[검증과 측정 왜곡]]
- **검증됨** → [[잔차 분석]]
- **기인** → [[전류 범위 전환 왜곡]]
