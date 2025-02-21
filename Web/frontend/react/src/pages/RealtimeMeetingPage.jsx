import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import RealtimeNote from "../components/RealtimeNote"; // 변경된 STT 페이지
import RealtimeDoc from "../components/RealtimeDoc"; // 변경된 RAG 문서 페이지
import { useNavigate, useParams } from "react-router-dom"; // 페이지 이동을 위한 useNavigate
import axiosInstance from '../api/axiosInstance';  // axiosInstance import
import useSSE from "../hooks/useSSE"; // ✅ SSE 훅 가져오기
import { fetchMeetingDetails } from "../api/meetingRoom";
// 모달 스타일 설정
const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const MeetingPageContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  gap: 24px;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1.2;
  background-color: white;
  border-radius: 16px;
  min-width: 900px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const RightPanel = styled.div`
  flex: 0.8;
  background-color: white;
  border-radius: 16px;
  height: calc(100vh - 48px);
  min-width: 600px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Button = styled.button`
  background-color: #274c77;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #1b3a57;
  }
`;

// Styled components for meeting info
const MeetingInfoContainer = styled.div`
  background-color: white;
  border-radius: 16px 16px 0 0;
  padding: 28px 32px;
  margin-bottom: 0;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #e2e8f0;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }

  &:first-child {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const SecondaryInfoRow = styled(InfoRow)`
  margin-bottom: 16px;
  font-size: 14px;
  color: #4a5568;
  gap: 24px;
  flex-wrap: wrap;
`;

const SecondaryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #274c77;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  ${props => props.isDateTime && `
    .date {
      color: #274c77;
      font-weight: 600;
      margin-right: 4px;
    }
    .time {
      color: #4a5568;
      font-weight: 500;
    }
  `}
`;

const ParticipantsList = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  
  span {
    color: #4a5568;
    position: relative;
    padding-right: 12px;
    
    &:not(:last-child)::after {
      content: "•";
      position: absolute;
      right: 0;
      color: #cbd5e0;
    }
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #274c77;
  min-width: 80px;
  padding-top: 4px;
  letter-spacing: -0.3px;
`;

const Content = styled.span`
  color: #1a202c;
  font-size: 15px;
  line-height: 1.5;
  flex: 1;
  font-weight: ${props => props.isTitle ? '700' : '500'};

  ${props => props.isTitle && `
    font-size: 20px;
    color: #1a202c;
    line-height: 1.4;
    letter-spacing: -0.5px;
  `}
`;

const AgendaList = styled.div`
  margin-top: 5px;
  color: #212529;
  font-size: 0.9rem;
  
  span {
    background-color: #e9ecef;
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 8px;
    display: inline-block;
    margin-bottom: 4px;
  }
`;

const MessageContainer = styled.div`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &.plain {
    background-color: white;
  }
  
  &.query {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
  }
  
  &.rag {
    background-color: #f3e5f5;
    border-left: 4px solid #9c27b0;
  }
`;

const RealtimeMeetingPage = () => {
  const { meetingId } = useParams();
  const { data } = useSSE(meetingId);
  const [error, setError] = useState(null); // 🔹 에러 상태 추가

  const [isReady, setIsReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);


  const [meetingInfo, setMeetingInfo] = useState(null);
  const [currentAgendaNum, setCurrentAgendaNum] = useState(1);
  const navigate = useNavigate();
  const [eventSource, setEventSource] = useState(null);
  const [sttText, setSttText] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  console.log("Current meeting ID:", meetingId);

  const handleDocumentUpdate = (newDocuments) => {
    console.log("📂 새로운 문서 업데이트 (부모에서 관리):", newDocuments);
    setDocuments(newDocuments);
  };

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const meetingInfo = await fetchMeetingDetails(meetingId);
        setMeetingInfo(meetingInfo);
      } catch (error) {
        console.error("회의 정보 로드 중 오류:", error);
        setError("회의 정보를 불러오는데 실패했습니다.");
      }
    };

    fetchMeetingData();
  }, [meetingId]);
  useEffect(() => {
    console.log("현재 meetingInfo:", meetingInfo);
  }, [meetingInfo]);


  // 페이지 로드 시 SSE 연결만 수행
  useEffect(() => {
    if (!data) return;

    console.log("🎯 SSE 데이터 감지:", data);
    console.log("현재 data.type:", data.type);

    // 안건 업데이트나 추가 시 처리
    if (data.type === "agenda_update" || data.type === "agenda_added" || data.type === "add_agenda") {
        console.log("📌 안건 정보 변경 감지");
        // 회의 정보 다시 불러오기
        const refreshMeetingData = async () => {
            try {
                console.log("🔄 회의 정보 새로고침 시도...");
                console.log("현재 meetingId:", meetingId);
                const updatedMeetingInfo = await fetchMeetingDetails(meetingId);
                console.log("📥 새로 받아온 회의 정보:", updatedMeetingInfo);
                setMeetingInfo(updatedMeetingInfo);
                console.log("✅ 회의 정보가 성공적으로 새로고침됨");
            } catch (error) {
                console.error("❌ 회의 정보 새로고침 중 오류:", error);
                console.error("에러 상세:", error.response?.data || error.message);
            }
        };
        refreshMeetingData();
    }

    // 기존의 meeting_state 관련 코드는 그대로 유지
    if (data.meeting_state) {
        console.log("회의 상태 변경:", data.meeting_state);

        switch (data.meeting_state) {
            case "waiting_for_start":
                setIsReady(true);
                setIsPreparing(false);
                break;
            case "meeting_in_progress":
                setIsMeetingStarted(true);
                break;
            case "meeting_finished":
                alert("회의가 종료되었습니다.");
                navigate("/dashboard");
                break;
            default:
                console.warn("알 수 없는 상태:", data.meeting_state);
        }
    }
}, [data, navigate, meetingId]);

  // meetingInfo가 업데이트되는지 확인하기 위한 useEffect 추가
  useEffect(() => {
    console.log("📊 meetingInfo 업데이트됨:", meetingInfo);
  }, [meetingInfo]);

  // 회의 준비 버튼 클릭 시에만 스케줄러 실행
  const handlePrepareMeeting = async () => {
    console.log("회의 준비 시작");
    setIsPreparing(true);
    setError(null);

    try {
      // 1. 스케줄러 실행 (회의 준비 버튼 클릭 시에만!)
      const schedulerResponse = await axiosInstance.get(`/meetings/scheduler/${meetingId}/`);
      
      if (schedulerResponse.status === 200) {
        // 2. 회의 준비 요청
        const prepareResponse = await axiosInstance.post('/meetings/prepare/', {
          meeting_id: meetingId,
          agenda_id: meetingInfo?.meeting_agendas[0]?.id,
          agenda_title: meetingInfo?.meeting_agendas[0]?.title
        });

        if (prepareResponse.status === 200) {
          console.log("회의 준비 완료");
          // 서버가 SSE를 통해 'waiting_for_start' 상태를 보내줄 것임
        }
      }
    } catch (error) {
      console.error("회의 준비 중 오류 발생:", error);
      setError(error.message || "서버와 연결할 수 없습니다. 다시 시도해 주세요.");
      setIsPreparing(false);
    }
  };

  // 회의 시작 처리
  const handleStartMeeting = async () => {
    if (!meetingInfo) {
      setError("회의 정보가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      // 모달을 닫는 로직이 필요하다면 여기에 추가
      setIsModalOpen(false);

      // 회의 시작 로직
      console.log("회의 시작 중...");
      const firstAgenda = meetingInfo.meeting_agendas[0];
      const requestData = {
        meeting_id: parseInt(meetingId),  // 문자열을 숫자로 변환
        agenda_id: firstAgenda?.id ? parseInt(firstAgenda.id) : null,  // null 처리 추가
        agenda_title: firstAgenda?.title || null  // null 처리 추가
      };

      console.log("회의 시작 요청 데이터:", requestData);
      
      const response = await axiosInstance.post('/meetings/start/', requestData);

      console.log("회의 시작 응답:", response.data);

      if (response.status === 200) {
        if (response.data.status === 'error' && response.data.message === 'Meeting is already in progress.') {
          setIsMeetingStarted(true);
        } else {
          setIsMeetingStarted(true);
        }
      }
    } catch (error) {
      console.error("회의 시작 중 오류:", error);
      console.error("요청 데이터:", error.config?.data);
      console.error("서버 응답:", error.response?.data);
      console.error("에러 상태 코드:", error.response?.status);
      
      if (error.response?.data?.message === 'Meeting is already in progress.') {
        setIsMeetingStarted(true);
      } else {
        setError(error.response?.data?.message || "회의 시작에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  // 메시지 렌더링
  const renderMessages = () => {
    return sttText.map((item, index) => (
      <MessageContainer 
        key={index} 
        className={item.type}
      >
        {item.message}
      </MessageContainer>
    ));
  };


  const rightPanelStyle = {
    flex: '0 0 50%',
    padding: '20px',
    boxSizing: 'border-box',
  };


  // 반응형 스타일
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  if (mediaQuery.matches) {
    rightPanelStyle.display = 'none'; // 화면이 줄어들면 오른쪽 패널 숨김
  }


  // RealtimeNote로부터 회의 정보를 받아오는 콜백 함수
  const handleMeetingInfo = (info) => {
    console.log('안건 데이터 구조:', JSON.stringify(info.meeting_agendas, null, 1));
    setMeetingInfo(info);
  };

  const handleEndMeeting = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('[회의 종료] 토큰 확인:', token); // 토큰 값 확인

      const config = {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('[회의 종료] 요청 설정:', {
        url: '/meetings/stop/',
        data: { meeting_id: meetingId },
        headers: config.headers
      });

      const response = await axiosInstance.post('/meetings/stop/', {
        meeting_id: meetingId
      }, config);

      console.log('[회의 종료] 응답:', response.data);

      // EventSource 연결 종료
      if (eventSource) {
        eventSource.close();
      }

      // 로컬 스토리지 데이터 정리
      localStorage.removeItem(`meeting_${meetingId}_stt`);
      
      alert('회의가 종료되었습니다.');
      // 대시보드로 이동
      navigate('/dashboard');
      
    } catch (error) {
      console.error('[회의 종료] 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
        url: error.config?.url,
        token: localStorage.getItem('authToken')
      });
      alert('회의 종료 중 오류가 발생했습니다.');
    }
  };

  // 회의 상태에 따른 화면 렌더링
  const renderMeetingStateScreen = () => {
    if (isPreparing) {
      return (
        <ModalBackground>
          <ModalContainer>
            <h3>회의 준비 중...</h3>
            <p>🚀지금 당장 떠날 수 있다면 어디로 여행 가고 싶나요?</p>
          </ModalContainer>
        </ModalBackground>
      );
    }

    if (isReady && !isMeetingStarted) {
      return (
        <ModalBackground>
          <ModalContainer>
            <h3>회의를 시작하시겠습니까?</h3>
            <Button onClick={handleStartMeeting}>회의 시작</Button>
          </ModalContainer>
        </ModalBackground>
      );
    }

    if (!isMeetingStarted) {
      return (
        <ModalBackground>
          <ModalContainer>
            <h3>회의 준비가 필요합니다</h3>
            <Button onClick={handlePrepareMeeting}>회의 준비</Button>
          </ModalContainer>
        </ModalBackground>
      );
    }

    return (
      <>
        <LeftPanel>
          {meetingInfo && (
            <MeetingInfoContainer>
              <InfoRow>
                <InfoItem style={{ flex: 2 }}>
                  <Label>회의명</Label>
                  <Content isTitle>{meetingInfo.title}</Content>
                </InfoItem>
                <InfoItem>
                  <Label>프로젝트</Label>
                  <Content isTitle>{meetingInfo.project.name}</Content>
                </InfoItem>
              </InfoRow>
              <SecondaryInfoRow>
                <SecondaryInfo isDateTime>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="date">
                    {new Date(meetingInfo.starttime).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="time">
                    {meetingInfo.starttime.split(' ')[1].slice(0, 5)} ~ {meetingInfo.endtime.split(' ')[1].slice(0, 5)}
                  </span>
                </SecondaryInfo>
                <SecondaryInfo>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  {meetingInfo.booker}
                </SecondaryInfo>
                <SecondaryInfo>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                  <ParticipantsList>
                    {meetingInfo.meeting_participants.map((participant, index) => (
                      <span key={index}>{participant.name}</span>
                    ))}
                  </ParticipantsList>
                </SecondaryInfo>
              </SecondaryInfoRow>
              <InfoRow>
                <InfoItem style={{ width: '100%' }}>
                  <Label>안건</Label>
                  <AgendaList>
                    {meetingInfo.meeting_agendas?.map((agenda, index) => (
                      <span key={agenda.id}>
                        {index + 1}. {agenda.title}
                      </span>
                    ))}
                  </AgendaList>
                </InfoItem>
              </InfoRow>
            </MeetingInfoContainer>
          )}
          <RealtimeNote 
            meetingInfo={meetingInfo} 
            currentAgendaNum={currentAgendaNum}
            onEndMeeting={handleEndMeeting}
            onDocumentUpdate={handleDocumentUpdate}
          />
        </LeftPanel>
        <RightPanel>
          <RealtimeDoc 
            meetingInfo={meetingInfo} 
            documents={documents}
            data={data}
            meetingId={meetingId}
          />
        </RightPanel>
      </>
    );
  };

  return (
    <MeetingPageContainer>
      {renderMeetingStateScreen()}
      <div className="messages">
        {renderMessages()}
      </div>
      {isModalOpen && (
        <ModalBackground>
          <ModalContainer>
            <h3>회의를 시작하시겠습니까?</h3>
            <Button onClick={handleStartMeeting}>회의 시작</Button>
          </ModalContainer>
        </ModalBackground>
      )}
    </MeetingPageContainer>
  );
};

export default RealtimeMeetingPage;