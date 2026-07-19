---
id: EIS_RAW_DATA
title: 원시 EIS 데이터
title_en: Raw EIS data
type: DataStructure
domain: applications
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Raw EIS data
tags:
- EIS
- applications
- DataStructure
relations:
- type: PART_OF
  target: MOC_APPLICATIONS
  confidence: 1
- type: HAS_COMPONENT
  target: EIS_COMPLEX_IMPEDANCE
  confidence: 1
- type: HAS_COMPONENT
  target: EIS_VOLTAGE_RESPONSE
  confidence: 1
- type: HAS_COMPONENT
  target: EIS_CURRENT_RESPONSE
  confidence: 1
- type: REPRESENTED_BY
  target: EIS_METADATA
  confidence: 1
language: ko
---

# 원시 EIS 데이터 (Raw EIS data)

## 핵심 정의

주파수별 임피던스와 가능한 경우 원시 전압·전류 시간신호, 범위와 품질 정보를 포함한 데이터이다.

## 개념 이해

전처리 전 데이터를 보존하면 측정 왜곡 재검토, 새로운 분석 및 재현성 평가가 가능하다.

## EIS에서의 역할

표, 텍스트, 제조사 전용 이진 파일 및 표준 교환 형식으로 저장된다.

## 성립 조건과 실험 해석

단위, 부호, 주파수 차수, 누락점과 교정 정보를 포함해야 한다.

## 한계와 흔한 오해

가공된 선도 이미지만으로 원시 데이터가 대체되지 않는다.

## 관련 개념

- **상위 영역** → [[응용과 보고]]
- **구성** → [[복소 임피던스]]
- **구성** → [[교류 전압 응답]]
- **구성** → [[교류 전류 응답]]
- **표현됨** → [[EIS 메타데이터]]
