#!/usr/bin/env python3
import re
import sys
import io

# 터미널 출력 인코딩 설정 (Windows에서 UTF-8 강제 설정)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Git이 전달한 커밋 메시지 파일 경로 읽기
commit_msg_filepath = sys.argv[1]

# 커밋 메시지 파일의 내용을 읽음
with open(commit_msg_filepath, 'r', encoding='utf-8') as file:
    commit_msg = file.read().strip()

print(f"검사할 커밋 메시지: {commit_msg}")

# 커밋 메시지 패턴 정의
pattern = r"^(feat|fix|docs|style|refactor|test|chore)\((FE|BE|AI|DA|EM|ETC)\): .+\n\n[^\n]+\n?(.*\n)*\n#S12P11B203-\d+$"

# 정규식 검증
if not re.match(pattern, commit_msg):
    print("❌ 커밋 메시지가 컨벤션에 맞지 않습니다.")
    print(
        "커밋 메시지 형식 예시:\n"
        "  feat(BE): 로그인 기능 추가\n\n"
        "  유효성 검사를 모두 마친 로그인 기능 추가\n\n"
        "  #S12P11B203-16\n\n"
        "Type의 의미:\n"
        "  feat      : 새로운 기능 추가\n"
        "  fix       : 버그 수정\n"
        "  docs      : 문서 작업 (예: README 수정)\n"
        "  style     : 코드 포맷팅, 세미콜론 누락 등 코드 스타일 수정 (기능 변화 없음)\n"
        "  refactor  : 리팩토링 (기능 변경 없이 코드 구조 개선)\n"
        "  test      : 테스트 추가/수정\n"
        "  chore     : 빌드 작업, 패키지 관리 등 기타 변경 사항\n\n"
        "Scope의 의미:\n"
        "  FE        : 프론트엔드 관련 작업\n"
        "  BE        : 백엔드 관련 작업\n"
        "  AI        : 인공지능 관련 작업\n"
        "  DA        : 데이터 분석 관련 작업\n"
        "  EM        : 임베디드 관련 작업\n"
        "  ETC       : 기타 작업\n"
    )
    sys.exit(1)

print("✅ 커밋 메시지가 컨벤션에 맞습니다.")
