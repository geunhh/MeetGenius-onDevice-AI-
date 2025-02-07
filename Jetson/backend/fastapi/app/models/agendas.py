from pydantic import BaseModel # 데이터 검증을 위한 모델

class AgendaItem(BaseModel):
    agenda_title: str
    agenda_result: str

class AgendaData(BaseModel):
    items: list[AgendaItem]