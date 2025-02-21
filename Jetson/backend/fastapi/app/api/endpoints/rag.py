from fastapi import APIRouter
from pydantic import BaseModel # 데이터 검증을 위한 모델


# 라우터 설정
router = APIRouter(
    prefix="/api/rag",
)

# 유효성 데이터 검사용 model
class Before_meeting(BaseModel):
    doc_ids : list
    meeting_title : str
    agenda_titles : list


@router.get("/")
def test():
    return 'rag page'

@router.post('/before_meeting/')
async def before_meeting(item:Before_meeting):
    # item_dict = item.dict()
    if item.agenda_titles != []:
        print(item.doc_ids)
        print(item.agenda_titles)
        print(item.meeting_title)
        '''
        RAG 
        '''
        return '송수신 완료'
    # 안건이 비었을 경우
    '''

    '''
    return '안건이 비었습니다.' 