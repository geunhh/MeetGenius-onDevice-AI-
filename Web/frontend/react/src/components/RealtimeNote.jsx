import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';
import useSSE from "../hooks/useSSE"; // ✅ SSE 훅 가져오기

const TextMessage = styled.div`
  margin: 12px 0;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  
  ${props => props.type === "plain" && `
    color: #1a202c;
    padding-left: 16px;
  `}

  ${props => props.type === "query" && `
    background-color:rgb(243, 243, 243);
    position: relative;
    padding-left: 44px;
    border: 1px solidrgb(219, 235, 255);
    
    &::before {
      content: "💭";
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }
  `}

  ${props => props.type === "agenda_docs_update" && `
    background-color: #EEF2F7;
    position: relative;
    padding-left: 44px;
    border: 1px solid #E5E9F0;
    
    &::before {
      content: "🤖";
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }
  `}
`;

const ButtonContainer = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.primary && `
    background-color: #274c77;
    color: white;
    border: none;

    &:hover {
      background-color: #1a365d;
    }
  `}

  ${props => props.danger && `
    background-color: #white;
    color: #dc2626;
    border: 1px solid #dc2626;

    &:hover {
      background-color: #dc2626;
      color: white;
    }
  `}
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  padding-bottom: 80px; // 버튼 컨테이너 높이만큼 여백 추가
`;


const AgendaTransition = styled.div`
  background-color: white;
  color: #274c77;
  padding: 14px 18px;
  margin: 16px 0;
  border-radius: 6px;
  border-bottom: 2px solid #274c77;
  
  .agenda-number {
    font-size: 15px;
    color: #6096ba;
    margin-bottom: 4px;
    font-weight: 500;
  }
  
  .agenda-title {
    font-size: 20px;
    font-weight: 700;
    color: #274c77;
  }

  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RealtimeNote = ({ meetingInfo, currentAgendaNum, onEndMeeting, onDocumentUpdate }) => {
  const { meetingId } = useParams();
  const { data } = useSSE(meetingId);
  const [actualCurrentAgenda, setActualCurrentAgenda] = useState(currentAgendaNum);
  const [accumulatedMessages, setAccumulatedMessages] = useState(() => {
    const saved = localStorage.getItem(`meeting_${meetingId}_messages`);
    return saved ? JSON.parse(saved) : [];
  });

  const contentAreaRef = useRef(null); // ContentArea에 대한 ref 추가
  
  // 누적 메시지가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(`meeting_${meetingId}_messages`, JSON.stringify(accumulatedMessages));
  }, [accumulatedMessages, meetingId]);

  // meetingInfo가 처음 로드될 때 첫 번째 안건 표시
  useEffect(() => {
    if (!meetingInfo?.meeting_agendas) {
        console.log("❌ meetingInfo 또는 meeting_agendas가 없음");
        return;
    }
    
    console.log("📋 회의 정보 로드됨:", meetingInfo);
    console.log("📝 현재 누적 메시지:", accumulatedMessages);
    
    // 첫 번째 안건 가져오기
    const firstAgenda = meetingInfo.meeting_agendas[0]; // order로 찾는 대신 첫 번째 항목 사용
    
    console.log("🎯 첫 번째 안건:", firstAgenda);
    
    if (firstAgenda) {
        const initialAgendaMessage = {
            type: "agenda_transition",
            agendaNumber: firstAgenda.order,
            title: firstAgenda.title,
            timestamp: new Date().toISOString()
        };
        
        console.log("📢 초기 안건 메시지 생성:", initialAgendaMessage);
        
        // 안건 관련 메시지가 없을 때만 추가
        const hasAgendaMessage = accumulatedMessages.some(msg => msg.type === "agenda_transition");
        if (!hasAgendaMessage) {
            console.log("✅ 첫 번째 안건 메시지 추가");
            setAccumulatedMessages([initialAgendaMessage]);
            setActualCurrentAgenda(firstAgenda.order);
        }
    }
  }, [meetingInfo]);

  // SSE 메시지 수신 처리
  useEffect(() => {
    if (!data) return;
    console.log("📡 [SSE] 수신된 데이터:", data);

    try {
        // 안건 전환 이벤트 처리
        if (data.type === "agenda_update" && data.cur_agenda) {
            const nextAgendaNum = parseInt(data.cur_agenda);
            
            if (actualCurrentAgenda === nextAgendaNum) return;
            
            setActualCurrentAgenda(nextAgendaNum);
            
            const nextAgenda = meetingInfo?.meeting_agendas?.find(
                agenda => agenda.order === nextAgendaNum
            );

            if (nextAgenda) {
                const transitionMessage = {
                    type: "agenda_transition",
                    agendaNumber: nextAgendaNum,
                    title: nextAgenda.title,
                    timestamp: new Date().toISOString()
                };
                
                setAccumulatedMessages(prev => [...prev, transitionMessage]);
            }
        }

        // 안건 추가 이벤트 처리
        if (data.type === "agenda_added") {
            console.log("📌 새로운 안건 추가됨:", data.new_agenda);
            const newAgendaMessage = {
                type: "agenda_change",
                message: `안건 ${data.new_agenda.order}. ${data.new_agenda.title}`,
                timestamp: new Date().toISOString(),
                agendaNumber: data.new_agenda.order
            };

            const dividerMessage = {
                type: "divider",
                timestamp: new Date().toISOString(),
                agendaNumber: data.new_agenda.order
            };

            setAccumulatedMessages(prev => [...prev, dividerMessage, newAgendaMessage]);
        }

        // ✅ 문서 업데이트 감지 및 부모로 전달
        if (data.documents && data.type === "agenda_docs_update") {
          console.log("📂 문서 업데이트 감지:", data.documents);
          onDocumentUpdate(data.documents);
        }

        // ✅ 초기 데이터 처리 (첫 번째 STT 메시지 수신 시)
        if (data.stt_list && accumulatedMessages.length === 0) {
          const initialMessages = [];
          
          // 모든 안건에 대한 구분선과 제목 추가
          meetingInfo?.meeting_agendas?.forEach((agenda, index) => {
            if (index === 0) {
              initialMessages.push({
                type: "divider",
                timestamp: new Date().toISOString(),
                agendaNumber: agenda.order
              });
              
              initialMessages.push({
                type: "agenda_change",
                message: `안건 ${agenda.order}. ${agenda.title}`,
                timestamp: new Date(new Date().getTime() + 1).toISOString(),
                agendaNumber: agenda.order
              });
            }
          });

          // STT 메시지 처리
          const newMessages = data.stt_list.map(msg => ({
            message: msg,
            type: "plain",
            timestamp: new Date().toISOString(),
            agendaNumber: actualCurrentAgenda // 현재 안건 번호 추가
          }));

          // 누적 메시지에 추가 (초기 구분선/제목 + 메시지)
          setAccumulatedMessages([...initialMessages, ...newMessages]);
        }

        // 나머지 이벤트 처리...
        if (data.type && data.message) {
            const messageWithTimestamp = {
                ...data,
                timestamp: new Date().toISOString(),
                agendaNumber: actualCurrentAgenda
            };
            setAccumulatedMessages(prev => [...prev, messageWithTimestamp]);
        }
    } catch (error) {
        console.error('[SSE] 메시지 처리 오류:', error);
    }
}, [data, meetingInfo, actualCurrentAgenda]);


  // 다음 안건으로 이동
  const handleNextAgenda = async () => {
    try {
      const response = await axiosInstance.post('meetings/next_agenda/');
      console.log("다음 안건 응답:", response.data);
      
      console.log("현재 안건 번호:", actualCurrentAgenda);
      console.log("전체 안건:", meetingInfo.meeting_agendas);
      
      // 현재 실제 안건 번호 사용
      const nextAgendaNum = actualCurrentAgenda + 1;
      console.log("계산된 다음 안건 번호:", nextAgendaNum);
      
      // order 속성을 기준으로 현재 안건과 다음 안건 찾기
      const currentAgenda = meetingInfo.meeting_agendas.find(
        agenda => agenda.order === actualCurrentAgenda
      );
      const nextAgenda = meetingInfo.meeting_agendas.find(
        agenda => agenda.order === nextAgendaNum
      );
      
      if (nextAgenda) {
        // 안건 구분선 추가
        const dividerMessage = {
          type: "divider",
          timestamp: new Date().toISOString(),
          agendaNumber: nextAgendaNum
        };
        
        // 새 안건 시작 메시지 추가
        const agendaChangeMessage = {
          type: "agenda_change",
          message: `안건 ${nextAgenda.order}. ${nextAgenda.title}`,
          timestamp: new Date(new Date().getTime() + 1).toISOString(), // 구분선 다음에 표시되도록 1ms 추가
          agendaNumber: nextAgendaNum
        };
        
        // 누적 메시지에 구분선과 새 안건 시작 메시지 추가
        setAccumulatedMessages(prev => [...prev, dividerMessage, agendaChangeMessage]);
        

        alert(`${currentAgenda.title}에서 ${nextAgenda.title}로 이동합니다`);
      } else {
        alert("마지막 안건입니다.");
        console.log("더 이상 다음 안건이 없습니다.");
      }
    } catch (error) {
      console.error("다음 안건 이동 중 오류:", error);
      alert("다음 안건으로 이동하는 중 오류가 발생했습니다.");
    }
  };


  // 회의 종료 핸들러
  const handleEndMeeting = () => {
    try {
      // localStorage 데이터 삭제
      localStorage.removeItem(`meeting_${meetingId}_messages`);
      
      // 상태 초기화
      setAccumulatedMessages([]);
      // setSttText([]);
      
      // 상위 컴포넌트의 종료 핸들러 호출
      onEndMeeting();
    } catch (error) {
      console.error("회의 종료 중 오류 발생:", error);
    }
  };

  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = useCallback(() => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTop = contentAreaRef.current.scrollHeight;
    }
  }, []);

  // accumulatedMessages가 업데이트될 때마다 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [accumulatedMessages, scrollToBottom]);

  return (
    <>
      <ContentArea ref={contentAreaRef}>
        {accumulatedMessages.length > 0 ? (
          accumulatedMessages.map((message, index) => (
            <div key={index}>
              {message.type === "agenda_transition" && (
                <AgendaTransition>
                  <div className="agenda-number">안건 {message.agendaNumber}</div>
                  <div className="agenda-title">{message.title}</div>
                </AgendaTransition>
              )}
              {message.type === "plain" && <TextMessage type="plain">{message.message}</TextMessage>}
              {message.type === "query" && <TextMessage type="query">{message.message}</TextMessage>}
              {message.type === "agenda_docs_update" && (
                <TextMessage type="agenda_docs_update">
                  {message.message}
                </TextMessage>
              )}

            </div>
          ))
        ) : (
          <p>아직 기록된 내용이 없습니다.</p>
        )}
      </ContentArea>
      <ButtonContainer>
        <ActionButton 
          danger 
          onClick={handleEndMeeting}
        >
          회의 종료
        </ActionButton>
        <ActionButton 
          primary 
          onClick={handleNextAgenda}
          disabled={!meetingInfo?.meeting_agendas?.length > currentAgendaNum}
        >
          다음 안건
        </ActionButton>
      </ButtonContainer>
    </>
  );
};

export default RealtimeNote;
