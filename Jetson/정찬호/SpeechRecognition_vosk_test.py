# pip install vosk
# 인터넷 연결 불가하더라도 사용 가능 

from vosk import Model, KaldiRecognizer
import wave

model = Model("model")  # Vosk 모델 경로
wf = wave.open("audio.wav", "rb")
rec = KaldiRecognizer(model, wf.getframerate())

while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    if rec.AcceptWaveform(data):
        print(rec.Result())
