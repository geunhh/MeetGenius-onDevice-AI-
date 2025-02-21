# pip install SpeechRecognition
# pip install pyaudio


import speech_recognition as sr

r = sr.Recognizer()  # Recognizer 객체 생성

with sr.Microphone() as source:  # 마이크로폰을 오디오 소스로 사용
    print("말씀하세요:")
    audio = r.listen(source)     # 사용자의 음성을 듣고 오디오 데이터로 변환
   
  
try:
    text = r.recognize_google(audio, language='ko-KR')  # Google Web Speech API를 사용하여 음성을 텍스트로 변환
    print(f"인식된 텍스트: {text}")
except sr.UnknownValueError:
    print("음성을 이해하지 못했습니다.")
except sr.RequestError as e:
    print(f"서비스에 문제가 발생했습니다: {e}")

"""
[ 결과 ]
SSAFY@DESKTOP-QFN2D55 MINGW64 ~/Desktop/PJT_01/WHISPER_test
$ python test.py
말씀하세요:
인식된 텍스트: 마이크 테스트 하나 둘 셋 마이크 테스트 하나 둘 셋
"""
# 성공하지만, API를 사용하는 예제이므로 온디바이스 환경에서 사용하는 데에 무리가 있음
