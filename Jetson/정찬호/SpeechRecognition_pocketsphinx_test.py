# pip install pocketsphinx
# 인터넷 연결 불가하더라도 사용 가능 

import speech_recognition as sr

recognizer = sr.Recognizer()
with sr.AudioFile('audio.wav') as source:
    audio = recognizer.record(source)
try:
    text = recognizer.recognize_sphinx(audio)
    print("Recognized Text:", text)
except sr.UnknownValueError:
    print("Sphinx could not understand audio")
except sr.RequestError as e:
    print("Sphinx error; {0}".format(e))
