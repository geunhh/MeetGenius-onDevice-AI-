"""
pip install pocketsphinx
"""
# 인터넷 연결 불가하더라도 사용 가능 

from pocketsphinx import Pocketsphinx, get_model_path

model_path = get_model_path()

ps = Pocketsphinx(
    hmm='ko/acoustic',
    lm='ko/language/ko.lm',
    dic='ko/dictionary/ko.dic'
)

ps.decode(
    audio_file='audio.wav',
    buffer_size=2048,
    no_search=False,
    full_utt=False
)

print(ps.hypothesis())

# 한국어 모델 지원 x