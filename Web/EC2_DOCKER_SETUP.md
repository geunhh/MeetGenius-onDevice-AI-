# EC2 서버 사용 방법 

## EC2 서버에 Docker, Docker-compose 설치 과정 
### 1. TEST 폴더 생성
### 2. TEST 폴더 내에 MM에 올라와있는 .pem 파일 업로드

- cf> .pem 파일은 Privacy Enhanced Mail의 약자로, 암호화 키, 인증서, 공개 키 등의 보안 정보를 저장하는 데 사용되는 파일 형식
기능중 1) SSH 키 관리

- AWS 같은 클라우드 서비스에서 .pem 파일로 SSH 접속용 개인 키를 제공함.

- chmod 400 key.pem으로 권한을 설정하고, ssh -i key.pem user@server로 접속 가능.

### 3. bash 창 키고, mm방에 올라와있는 line 입력
- EC2 서버에 pem 파일 이용해서 접속
```
ssh -i I12B203T.pem ubuntu@i12b203.p.ssafy.io
```
### 4. yes > yes > 웹서버 접속 성공 (우분투 환경)
- 접속한 환경의 경로는  /home/ubuntu고, 파일 없는게 정상

### 5. 아래 텍스트 확인하며 따라가기

---
### [ ufw 적용 순서 ]

제공되는 EC2의 ufw(우분투 방화벽)는 기본적으로 활성화(Enable) 되어 있고,

ssh 22번 포트만 접속 가능하게 되어 있습니다.

포트를 추가할 경우 6번부터 참고하시고,

처음부터 새로 세팅해 보실 경우에는 1번부터 참고하시기 바랍니다.

1. 처음 ufw 설정 시 실수로 ssh접속이 안되는 경우를 방지하기 위해 ssh 터미널을 여유있게 2~3개 연결해 놓는다.

2. ufw 상태 확인
```
$ sudo ufw status
Status : inactive
```

3. 사용할 포트 허용하기 (ufw inactive 상태)
```
$ sudo ufw allow 22
```

4. 등록한 포트 조회하기 (ufw inactive 상태)
```
$ sudo ufw show added
Added user rules (see 'ufw status' for running firewall):
ufw allow 22
```

5. ufw 활성화 하기
```
$ sudo ufw enable
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
```

6. ufw 상태 및 등록된 rule 확인하기
```
$ sudo ufw status numbered
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22                         ALLOW IN    Anywhere
[ 2] 22 (v6)                    ALLOW IN    Anywhere (v6)
```
7. 새로운 터미널을 띄워 ssh 접속해 본다.
```
C:\> ssh -i 팀.pem ubuntu@팀.p.ssafy.io
```

8. ufw 구동된 상태에서 80 포트 추가하기
```
$ sudo ufw allow 80
```

9. 80 포트 정상 등록되었는지 확인하기
```
$ sudo ufw status numbered
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22                         ALLOW IN    Anywhere
[ 2] 80                         ALLOW IN    Anywhere
[ 3] 22 (v6)                    ALLOW IN    Anywhere (v6)
[ 4] 80 (v6)                    ALLOW IN    Anywhere (v6)
```

10. allow 명령을 수행하면 자동으로 ufw에 반영되어 접속이 가능하다. 

11. 등록한 80 포트 삭제 하기
```
$ sudo ufw status numbered
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22                         ALLOW IN    Anywhere
[ 2] 80                         ALLOW IN    Anywhere
[ 3] 22 (v6)                    ALLOW IN    Anywhere (v6)
[ 4] 80 (v6)                    ALLOW IN    Anywhere (v6)
```

12. 삭제할 80 포트의 [번호]를 지정하여 삭제하기 / 번호 하나씩 지정하여 삭제한다.
```
$ sudo ufw delete 4
$ sudo ufw delete 2
$ sudo ufw status numbered  (제대로 삭제했는지 조회해보기)
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22                         ALLOW IN    Anywhere
[ 2] 22 (v6)                    ALLOW IN    Anywhere (v6)
```

13. (중요) 삭제한 정책은 반드시 enable을 수행해야 적용된다.
```
$ sudo ufw enable
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y입력
```

14. 기타 : ufw 끄기
```
$ sudo ufw disable
```
---


## 이후 도커, 도커 컴포즈 설치 및 실행
```bash
sudo ufw allow ssh
sudo ufw enable

# 도커 설치
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install docker-ce


# 도커 실행 및 컴포즈 설치 
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose


# 설치, 버전 확인
docker --version
docker-compose --version
```
---
### 테스트 과정

- 도커 관련 명령어
```bash
# docker-compose 실행 / (-d : 백그라운드에서 컨테이너를 실행)
docker-compose up -d

# 실행 중인 컨테이너 확인
docker-compose ps         
# 로그 확인 
docker-compose logs       

# 컨테이너 중지
docker-compose down       
# 다시 시작
docker-compose up -d     
```

### 로컬의 docker-compose 파일을 EC2에 올리는 방법
- EC2 bash 터미널 2개 열기
1. ec2 내부 터미널 이용해서 ec2의 실제 ip 알아내기 
>curl http://169.254.169.254/latest/meta-data/public-ipv4


2. 로컬 터미널로 yml 파일 하나 보내는법
>scp -i ./I12B203T.pem docker-compose.yml ubuntu@[받아온 ip]:/home/ubuntu/ 

- 양식: 
```
scp -i [키파일경로]/[키파일이름].pem docker-compose.yml ubuntu@[EC2_PUBLIC_IP]:/home/ubuntu/
```


cf. 폴더째로 보내기 
>scp -i [키파일경로]/[키파일이름].pem -r [전송할디렉토리] ubuntu@[EC2_PUBLIC_IP]:/home/ubuntu

---

- 폴더 하나에 웹 구조 다 만들어 놓고, 위 명령어로 폴더 그대로 보낸 후, 도커 컴포즈 명령어 이용해서 한번에 진행하면 될듯.

```
docker-compose up --build
```
## 그래서 어떻게 사용 ? 
- 위에서 폴더 만들고, pem 파일과 옮길 파일 넣어놨다고 가정

```bash
# 1. [BASH] EC2 서버에 pem 키 이용해 접속
ssh -i I12B203T.pem ubuntu@i12b203.p.ssafy.io

# 2. [EC2] 내부 터미널 이용해서 ec2의 public ip 알아내기 
curl http://169.254.169.254/latest/meta-data/public-ipv4

# 3. [BASH] 해당 ip로 Docker / compose 파일 + BE FE 저장된 project folder 전송
scp -i [키파일경로]/[키파일이름].pem -r [전송할디렉토리] ubuntu@[EC2_PUBLIC_IP]:/home/ubuntu

'''
[EC2] 포트 관련 명령어
sudo ufw status numbered
sudo ufw allow 80
sudo ufw delete 4
'''

# 4. [EC2] ufw 키기
sudo ufw enable

# 4. [EC2] project folder로 이동 후, docker-compose 파일 사용용
docker-compose up --build

# 5. [EC2] ufw 끄기
sudo ufw disable

'''
cf> 
장고나 react 켰을 때에, localhost 아닌 ip로 접속할 때에는
위에서 얻어온 ec2의 public ip로 접속
'''


```

