import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { addMeeting, setMeetings } from "../redux/meetingSlice"; // 리덕스 액션 import
import MeetingRoomCreateWidget from "./MeetingRoomCreateWidget";
import MeetingRoomListWidget from "./MeetingRoomListWidget";
import MeetingRoomDetailWidget from "./MeetingRoomDetailWidget";

// ✅ 컨테이너 스타일 (깔끔한 중앙 정렬)
const MeetingRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  width: 100%;
  margin-left: 40px; // 사이드바 너비만큼 마진 추가
  margin-top: 60px;   // 네비게이션바 높이만큼 마진 추가
`;

// ✅ 회의실 선택 버튼 스타일
const RoomSelectContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  position: sticky;  // 스크롤 시에도 고정
  top: 70px;        // 네비게이션바 아래에 고정
  z-index: 100;     // 다른 요소들 위에 표시
  background-color: white; // 스크롤 시 배경색 지정
  padding: 10px 0;
`;
const RoomButton = styled.button`
  background-color: ${(props) => (props.active ? "#1b3a57" : "transparent")};  // ✅ 선택된 경우만 색상 변경
  color: ${(props) => (props.active ? "white" : "#274c77")};  // ✅ 선택되지 않으면 글자색 유지
  padding: 12px 18px;
  border: 2px solid ${(props) => (props.active ? "#1b3a57" : "#274c77")}; // ✅ 선택되지 않은 경우 경계선 유지
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#1b3a57" : "#f0f0f0")}; // ✅ 선택되지 않은 버튼은 hover 시 연한 색상
  }
`;

// ✅ 메인 컨텐츠 박스 (회의 목록 + 상세보기/예약)
const ContentWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

// ✅ 회의 목록 컨테이너
const MeetingListContainer = styled.div`
  width: 650px;
  min-width: 650px;
  background: #ffffff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

// ✅ 예약 및 상세보기 컨테이너
const SidePanel = styled.div`
  width: 300px;
  min-width: 300px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 150px); // 뷰포트 높이를 고려한 최대 높이 설정
  overflow-y: auto; // 내용이 넘칠 경우 스크롤 표시
  position: relative; // 자식 요소의 위치 기준점 설정
`;

const BookingButton = styled.button`
  background-color: #1b3a57;  // ✅ 회의실 버튼과 조화로운 색상
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 0.5px;  // ✅ 텍스트 가독성 향상
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #274c77;  // ✅ hover 시 색상 변경
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);  // ✅ 부드러운 그림자 추가
  }

  &:active {
    transform: scale(0.95);  // ✅ 클릭 시 약간 작아지는 효과
  }
`;


const MeetingRoom = () => {
  const dispatch = useDispatch();
  const meetings = useSelector((state) => state.meetings);
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [isBookingVisible, setIsBookingVisible] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  const handleSelectRoom = (roomId) => {
    setSelectedRoom(roomId);
    setIsBookingVisible(false);
    setSelectedMeetingId(null);
  };

  const handleMeetingClick = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setIsBookingVisible(false);
  };

  const handleBookingClick = () => {
    setSelectedMeetingId(null);
    setIsBookingVisible(!isBookingVisible);
  };

  return (
    <MeetingRoomContainer>
      <RoomSelectContainer>
        <RoomButton
          active={selectedRoom === 0}
          onClick={() => handleSelectRoom(0)}
        >
          My Meetings
        </RoomButton>
        <RoomButton
          active={selectedRoom === 1}
          onClick={() => handleSelectRoom(1)}
        >
          회의실 1
        </RoomButton>
        <RoomButton
          active={selectedRoom === 2}
          onClick={() => handleSelectRoom(2)}
        >
          회의실 2
        </RoomButton>
      </RoomSelectContainer>

      <ContentWrapper>
        <MeetingListContainer>
          <MeetingRoomListWidget
            meetings={meetings}
            roomId={selectedRoom}
            onMeetingClick={handleMeetingClick}
            selectedRoom={selectedRoom}
            onBookingClick={handleBookingClick}
            isBookingVisible={isBookingVisible}
          />
        </MeetingListContainer>

        {(selectedMeetingId || isBookingVisible) && (
          <SidePanel>
            {selectedMeetingId ? (
              <MeetingRoomDetailWidget 
                meetingId={selectedMeetingId} 
                onClose={() => setSelectedMeetingId(null)} 
              />
            ) : (
              isBookingVisible && (
                <MeetingRoomCreateWidget 
                  roomId={selectedRoom}
                  onClose={() => setIsBookingVisible(false)}
                />
              )
            )}
          </SidePanel>
        )}
      </ContentWrapper>
    </MeetingRoomContainer>
  );
};

export default MeetingRoom;
