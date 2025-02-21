# Git Hook

git hook을 사용하기 위한 전체적인 플로우는 다음과 같다.

1. **Git Hook의 사용 목적 결정** 
   1. 커밋 메시지 형식 검증 ✅
   2. 코드 포맷팅 검사 
   3. 테스트 실행
   4. 린트 검사
   5. etc.
2. **Git Hook의 종류 선택** 
   1. pre-commit: git commit 전에 실행 
   2. commit-msg: 커밋 메시지 검증 ✅
   3. pre-push: git push 전에 실행 
   4. pre-rebase: rebase 전에 실행 
   5. etc.
3. **Hook 스크립트 작성** 
   1. 프로젝트 디렉토리에 Hook 스크립트를 작성 ✅
   2. Python, Bash, Node.js 등을 사용 
4. **Git Hook 설정 파일 구성** 
   기본적으로 Git Hook은 ./git/hooks 디렉토리에 저장
   1. 스크립트를 ./git/hoooks 디렉토리에 직접 배치 
   2. `pre-commit` 라이브러리를 사용해 쉽게 관리 ✅

    
</br>

## pre-commit 라이브러리

해당 리포지토리에서는 `pre-commit`을 사용하여 **커밋 메시지 검증**을 목적으로 한다.

0. `pre-commit`을 사용하는 경우 프로젝트 디렉토리 구조
    
    ```markdown
    project
    ├── .git
    │     └── hooks
    │          └── commit-msg.sample
    │          └── pre-commit.sample
    │          └── pre-push.sample
    │          └── pre-rebase.sample
    │
    ├── .pre-commit-config.yaml 
    │
    ├── scripts
    │     └── commit-msg-check.py
    │     └── ... 
    └── ...
    ```
    - `pre-commit` 라이브러리를 사용할 경우 .git/hooks 디렉토리는 따로 건드리지 않아도 되며,  
    scripts 디렉토리와 .pre-commit-config.yaml 파일은  
    아래 플로우에 따라 자연스럽게 생성하게 된다.
    
</br>

1. **pre-commit 설치**
    ```bash 
    pip install pre-commit
    ```
</br>

2. **프로젝트 루트에 .pre-commit-config.yaml 파일 작성** 
    ```yaml
    repos:
    - repo: local
        hooks:
        - id: commit-msg-check
            name: Commit Message Check
            entry: python3 scripts/commit-msg-check.py
            language: system
            stages: [commit-msg]

    ```

</br>

3. **프로젝트 루트에 scripts 디렉토리 생성** 
    ```bash
    mkdir scripts
    ```
    
</br>

4. **scripts/commit-msg-check.py 파일 작성** 
    ```py
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
    pattern = r"^\[(feat|fix|docs|style|refactor|test|chore)\] \[(FE|BE|AI|DA|EM|ETC)\] [^\s ]+(?:\s[^\s_]+)*_#S12P11B203-\d+$"

    # 정규식 검증
    if not re.match(pattern, commit_msg):
        print("#❌ 커밋 메시지가 컨벤션에 맞지 않습니다.")
        print(
            #
           
            커밋 메시지 형식 예시: feat(BE): 로그인 기능 추가 #S12P11B203-16\n\n"
            "Type의 의미:\n"
            "  feat      : 새로운 기능 추가\n"
            "  fix       : 버그 수정\n"
            "  docs      : 문서 작업 (예: README 수정)\n"
            "  style     : 코드 포맷팅, 세미콜론 누락 등 코드 스타일 수정 (기능 변화 없음)\n"
            "  refactor  : 리팩토링 (기능 변경 없이 코드 구조 개선)\n"
            "  test      : 테스트 추가/수정\n"
            "  chore     : 빌드 작업, 패키지 관리 등 기타 변경 사항\n\n"
            "테마의 의미:\n"
            "  FE        : 프론트엔드 관련 작업\n"
            "  BE        : 백엔드 관련 작업\n"
            "  AI        : 인공지능 관련 작업\n"
            "  DA        : 데이터 분석 관련 작업\n"
            "  EM        : 임베디드 관련 작업\n"
            "  ETC       : 기타 작업\n"
        )
        sys.exit(1)

    print("✅ 커밋 메시지가 컨벤션에 맞습니다.")


    ```

    | Type       | 의미                                     | 예시                                                        |
    |------------|------------------------------------------|-------------------------------------------------------------|
    | `feat`     | 새로운 기능 추가                         | `feat: 사용자 프로필 기능 추가`                              |
    | `fix`      | 버그 수정                                | `fix: 로그인 로직 버그 수정`                                 |
    | `docs`     | 문서 수정                                | `docs: README.md 업데이트`                                   |
    | `style`    | 코드 스타일 변경 (기능에 영향 없음)      | `style: 파일 인덴트 정리`                                    |
    | `refactor` | 코드 리팩토링 (기능 변화 없음)           | `refactor: 불필요한 변수 제거`                               |
    | `test`     | 테스트 코드 추가, 수정                   | `test: API 테스트 추가`                                      |
    | `chore`    | 기타 작업 (설정 파일, 빌드 스크립트 등)  | `chore: 프로젝트 의존성 업데이트`                            |
        


    | Theme  | 의미                           | 예시                                          |
    |--------|--------------------------------|-----------------------------------------------|
    | `FE`   | 프론트엔드 관련 작업           | `feat(FE): 사용자 프로필 UI 추가`             |
    | `BE`   | 백엔드 관련 작업               | `fix(BE): 로그인 API 버그 수정`              |
    | `AI`   | AI 관련 작업             | `feat(AI): 결함 탐지 모델 개발`              |
    | `DA`   | 데이터 분석 관련 작업          | `refactor(DA): 데이터 전처리 로직 최적화`    |
    | `EM`   | 임베디드 관련 작업             | `test(EM): 마이크 테스트 추가`          |
    | `ETC`  | 기타 작업                     | `chore(ETC): 배포 스크립트 작성`            |



5. **Git Hook 활성화**
    ```bash 
    pre-commit install --hook-type commit-msg
    ```
    
</br>

6. **테스트 및 디버깅** 
   - 의도한 Hook이 제대로 동작하는지 테스트
        ```bash 
        # 지정한 패턴에 맞지 않는 메시지 
        git commit -m "내 마음대로 커밋 메시지 작성" 

        ####################### 출력 예시 #######################

        ❌ 커밋 메시지가 컨벤션에 맞지 않습니다.
        커밋 메시지 형식 예시:

        feat(BE): 로그인 기능 추가

        유효성 검사를 모두 마친 로그인 기능 추가

        #S12P11B203-16

        Type의 의미:
        feat      : 새로운 기능 추가
        fix       : 버그 수정
        docs      : 문서 작업 (예: README 수정)
        style     : 코드 포맷팅, 세미콜론 누락 등 코드 스타일 수정 (기능 변화 없음)
        refactor  : 리팩토링 (기능 변경 없이 코드 구조 개선)
        test      : 테스트 추가/수정
        chore     : 빌드 작업, 패키지 관리 등 기타 변경 사항

        Scope의 의미:
        FE        : 프론트엔드 관련 작업
        BE        : 백엔드 관련 작업
        AI        : 인공지능 관련 작업
        DA        : 데이터 분석 관련 작업
        EM        : 임베디드 관련 작업
        ETC       : 기타 작업
        ########################################################

        # 지정한 패턴에 맞는 메시지
        git commit -m "[docs] README.md 파일 수정 (사용 방법 작성) #githook-02"

        ####################### 출력 예시 #######################
        ✅ 커밋 메시지가 컨벤션에 맞습니다.
        ########################################################
        ```
   - 필요하면 로그 출력 등을 추가해 디버깅 
      
</br>

1. **팀과 공유 (optional)**
   - .pre-commit-config.yaml과 관련 스크팁트를 저장소에 포함해 팀원에게 공윻 
   - 추가적으로 팀원들에게 pre-commit 설치 및 활성화 방법을 안내
