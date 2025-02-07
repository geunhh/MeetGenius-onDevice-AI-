""" 안건 관련 모델 정의 """

from pydantic import BaseModel, Field


class AgendaBase(BaseModel):
    """안건 기본 모델"""
    agenda_id: int = Field(..., description="안건 id")
    agenda_title: str = Field(..., description="안건명")
    
    
class AgendaList(BaseModel):
    project_id: str = Field(..., description="프로젝트 id")
    agenda_list: list[AgendaBase] = Field(..., description="안건 목록")


