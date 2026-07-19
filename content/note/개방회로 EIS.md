---
id: EIS_OCP_MEASUREMENT
title: 개방회로 EIS
title_en: Open-circuit EIS
type: MeasurementMethod
domain: measurement
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Open-circuit EIS
tags:
- EIS
- measurement
- MeasurementMethod
relations:
- type: PART_OF
  target: MOC_MEASUREMENT
  confidence: 1
- type: IS_A
  target: EIS_POTENTIOSTATIC
  confidence: 1
- type: REQUIRES
  target: EIS_EQUILIBRATION
  confidence: 1
- type: DEPENDS_ON
  target: EIS_DRIFT
  confidence: 1
language: ko
---

# 개방회로 EIS (Open-circuit EIS)

## 핵심 정의

외부 직류 전류가 거의 없는 개방회로 전위 부근에서 수행하는 EIS이다.

## 개념 이해

부식 전위나 휴지 상태 배터리처럼 자연 작동점을 기준으로 계면 응답을 조사한다.

## EIS에서의 역할

OCP 안정화와 드리프트 관리가 특히 중요하다.

## 성립 조건과 실험 해석

측정 중 개방회로 전위가 충분히 안정적이어야 한다.

## 한계와 흔한 오해

평균 전류가 0이라고 시스템이 열역학적 평형에 있다는 뜻은 아니다.

## 관련 개념

- **상위 영역** → [[측정과 계측]]
- **종류** → [[전위 제어 EIS]]
- **필요 조건** → [[측정 전 평형화]]
- **의존** → [[측정 중 드리프트]]
