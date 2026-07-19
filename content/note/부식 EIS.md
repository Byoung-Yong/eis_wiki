---
id: EIS_CORROSION_APPLICATION
title: 부식 EIS
title_en: Corrosion EIS
type: Application
domain: applications
status: reviewed
review_level: reviewed
last_reviewed: '2026-07-17'
publish: true
aliases:
- Corrosion EIS
tags:
- EIS
- applications
- Application
relations:
- type: PART_OF
  target: MOC_APPLICATIONS
  confidence: 1
- type: USES
  target: EIS_FILM_MODEL
  confidence: 1
- type: USES
  target: EIS_ADSORPTION_MODEL
  confidence: 1
- type: DEPENDS_ON
  target: EIS_DRIFT
  confidence: 1
language: ko
---

# 부식 EIS (Corrosion EIS)

## 핵심 정의

금속 용해, 부동태막, 도막, 흡착 및 물질 전달을 조사하는 EIS 응용이다.

## 개념 이해

OCP 드리프트, 표면 변화와 매우 큰 저주파 임피던스 때문에 정상성과 측정 시간이 중요하다.

## EIS에서의 역할

부식 저항, 도막 열화 및 부식 억제제 평가에 사용된다.

## 성립 조건과 실험 해석

노출 시간, 전해질, 면적, 전위와 표면 이력을 기록해야 한다.

## 한계와 흔한 오해

분극 저항을 부식률로 변환하려면 별도의 속도론적 관계가 필요하다.

## 관련 개념

- **상위 영역** → [[응용과 보고]]
- **사용** → [[계면막 임피던스 모델]]
- **사용** → [[흡착 임피던스 모델]]
- **의존** → [[측정 중 드리프트]]
