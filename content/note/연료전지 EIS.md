---
id: EIS_FUEL_CELL_APPLICATION
title: 연료전지 EIS
title_en: Fuel-cell EIS
type: Application
domain: applications
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Fuel-cell EIS
tags:
- EIS
- applications
- Application
relations:
- type: PART_OF
  target: MOC_APPLICATIONS
  confidence: 1
- type: USES
  target: EIS_POROUS_TLM
  confidence: 1
- type: USES
  target: EIS_DRT
  confidence: 1
- type: REQUIRES
  target: EIS_METADATA
  confidence: 1
language: ko
---

# 연료전지 EIS (Fuel-cell EIS)

## 핵심 정의

연료전지의 전극 반응, 이온전도, 기체 수송, 물 관리와 촉매층 분포를 조사하는 응용이다.

## 개념 이해

전극별 과정과 운전 조건이 겹치므로 DRT, TLM 및 섭동 연속 측정 자료가 자주 사용된다.

## EIS에서의 역할

성능 손실 분해와 오페란도 진단에 사용된다.

## 성립 조건과 실험 해석

온도, 습도, 유량, 압력, 전류 밀도와 셀 기하학적 구조를 기록해야 한다.

## 한계와 흔한 오해

DRT 피크 참조 목록이 모든 셀 구조에 동일하게 적용되는 것은 아니다.

## 관련 개념

- **상위 영역** → [[응용과 보고]]
- **사용** → [[다공성 전극 전송선 모델]]
- **사용** → [[완화 시간 분포]]
- **필요 조건** → [[EIS 메타데이터]]
