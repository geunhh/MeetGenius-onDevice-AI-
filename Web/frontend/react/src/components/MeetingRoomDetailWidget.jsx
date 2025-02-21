import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { deleteMeetingRoomBooking, updateMeetingRoomBooking } from "../api/meetingRoom"; // 예약 취소 및 수정 API 호출
import { useNavigate } from "react-router-dom"; // react-router-dom에서 useNavigate 가져오기



const DetailContainer = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  width: 100%;
  height: auto;
  min-height: 100%;
  box-sizing: border-box;
`;

const DetailHeader = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2d3748;
`;

const DetailItem = styled.div`
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  
  strong {
    min-width: 80px;
    color: #2d3748;
    margin-right: 8px;
    font-weight: 600;
  }
`;

const List = styled.ul`
  padding-left: 24px;
  margin: 8px 0 12px 0;
  list-style-type: disc;
  
  li {
    margin: 6px 0;
    color: #4a5568;
    font-size: 14px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #274c77;
  transition: all 0.2s ease;

  ${props => props.primary ? `
    background-color: #274c77;
    color: white;
    
    &:hover {
      background-color: #1b3a57;
    }
  ` : `
    background-color: white;
    color: #274c77;
    
    &:hover {
      background-color: #f8f9fa;
    }
  `}
`;

const baseURL = import.meta.env.VITE_APP_BASEURL;

const MeetingRoomDetailWidget = ({ meetingId, onClose }) => {
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate(); // navigate 정의

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/meetingroom/booked/${meetingId}/`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          }
        );
        setMeetingDetails(response.data);
      } catch (error) {
        console.error("회의 상세 정보를 불러오는 데 실패했습니다.", error);
        setError("회의 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId]);

  if (loading) return <p>회의 정보를 불러오는 중...</p>;
  if (error) return <p>{error}</p>;
  if (!meetingDetails) return <p>회의 정보가 없습니다.</p>;

  // 날짜 및 시간 포맷 변환 함수
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")} | ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };
  const handleDeleteBooking = async () => {
    if (!window.confirm("정말 이 회의를 취소하시겠습니까?")) {
      return;
    }

    try {
      const message = await deleteMeetingRoomBooking(meetingId);
      alert(message);
      onClose(); // 취소 후 창 닫기
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateBooking = async () => {
    try {
      const message = await updateMeetingRoomBooking(meetingId, formData);
      alert(message);
    } catch (error) {
      alert(error.message);
    }
  };

   // 회의 참가하기 버튼 클릭 시, 실시간 회의 페이지로 이동
   const handleJoinMeeting = () => {
    console.log("회의 참가하기 버튼 클릭됨");
    console.log("Meeting ID:", meetingId);
    navigate(`/realtime-meeting/${meetingId}`);
  };

  return (
    <DetailContainer>
      <DetailHeader>예약 내역</DetailHeader>
      <DetailItem><strong>회의명:</strong> {meetingDetails.title || "제목 없음"}</DetailItem>
      <DetailItem><strong>프로젝트:</strong> {meetingDetails.project?.name || "프로젝트 없음"}</DetailItem>
      <DetailItem><strong>회의실:</strong> ROOM {meetingDetails.room}</DetailItem>
      <DetailItem><strong>회의시간:</strong> {formatDateTime(meetingDetails.starttime)} - {formatDateTime(meetingDetails.endtime)}</DetailItem>
      <DetailItem><strong>주최자:</strong> {meetingDetails.booker || "주최자 없음"}</DetailItem>

      {/* 참석자 리스트 */}
      <DetailItem><strong>참여자:</strong></DetailItem>
      {meetingDetails.meeting_participants && meetingDetails.meeting_participants.length > 0 ? (
        <List>
          {meetingDetails.meeting_participants.map((participant, index) => (
            <li key={index}>{participant.name}</li>
          ))}
        </List>
      ) : (
        <DetailItem>참석자 없음</DetailItem>
      )}

      {/* 회의 안건 리스트 */}
      <DetailItem><strong>안건:</strong></DetailItem>
      {meetingDetails.meeting_agendas && meetingDetails.meeting_agendas.length > 0 ? (
        <List>
          {meetingDetails.meeting_agendas.map((item) => (
            <li key={item.order}> {item.title}</li>
          ))}
        </List>
      ) : (
        <DetailItem>안건 없음</DetailItem>
      )}

      {/* 버튼 */}
      <ButtonContainer>
      <Button onClick={handleDeleteBooking}>예약 취소</Button>
      <Button onClick={handleUpdateBooking}>예약 수정</Button>
      </ButtonContainer>
      <Button 
        primary 
        style={{ width: "100%", marginTop: "10px" }} 
        onClick={handleJoinMeeting}
      >
        회의 참가하기
      </Button>
    </DetailContainer>
  );
};

export default MeetingRoomDetailWidget;
