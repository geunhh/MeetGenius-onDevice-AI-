import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux"; // useSelector로 리덕스 상태 가져오기


const meetingColors = [
  "#E8E8E8", // 매우 연한 회색
  "#F0E0E0", // 매우 연한 회색 빛 핑크
  "#E8E8F0", // 매우 연한 회색 빛 블루
  "#F2F4F4", // 매우 연한 회색 빛 민트
  "#F2E8F4", // 매우 연한 회색 빛 라벤더
  "#E8F2E8", // 매우 연한 회색 빛 민트 그린
  "#E8F2F0", // 매우 연한 회색 빛 파스텔 블루
  "#F4F2E8", // 매우 연한 회색 빛 베이지
  "#F4E8F2", // 매우 연한 회색 빛 로즈
  "#F2E8F4", // 매우 연한 회색 빛 퍼플
];

// 🎨 meeting.id 기반으로 색상을 고정적으로 선택하는 함수
const getMeetingColor = (meetingId) => {
  if (!meetingId) return "white";
  // 동일한 meetingId는 항상 같은 색상을 반환하도록 해시 함수 사용
  const hash = meetingId.toString().split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return meetingColors[hash % meetingColors.length];
};

const Td = styled.td`
  padding: 8px 4px;
  height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid #eef2f6;
  background-color: ${(props) => getMeetingColor(props.meetingId)};
  cursor: ${(props) => (props.hasMeeting ? "pointer" : "default")};
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    ${(props) => props.hasMeeting && `
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `}
  }
`;


const TableContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 1px;
  font-size: 12px;
  table-layout: fixed;

  th {
    padding: 8px 4px;
    height: 32px;
    background: #f8f9fa;
    font-weight: 600;
    color: #2d3748;
    border: 1px solid #eef2f6;
    border-bottom: 2px solid #eef2f6;
    
    &:first-child {
      border-top-left-radius: 8px;
    }
    
    &:last-child {
      border-top-right-radius: 8px;
    }
  }

  th:first-child, td:first-child {
    width: 60px;
    padding-left: 12px;
    color: #718096;
    font-weight: 500;
  }

  tr:last-child {
    td:first-child {
      border-bottom-left-radius: 8px;
    }
    td:last-child {
      border-bottom-right-radius: 8px;
    }
  }
`;

const MeetingTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-weight: 600;
  font-size: 11.5px;
  color: #2d3748;
  text-align: center;
  letter-spacing: -0.2px;
`;

const BookingButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0 20px 12px 0;
`;

const BookingButton = styled.button`
  background-color: ${props => 
    props.disabled ? '#cccccc' : 
    props.children === '닫기' ? '#6c757d' : 
    '#1b3a57'
  };
  color: white;
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => 
      props.disabled ? '#cccccc' : 
      props.children === '닫기' ? '#495057' : 
      '#274c77'
    };
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const MeetingRoomBooked = ({ onMeetingClick, dates, selectedRoom, onBookingClick, isBookingVisible }) => {
  const meetings = useSelector((state) => state.meetings.meetings);
  const weekDays = ["월", "화", "수", "목", "금"];
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

  return (
    <>
      <BookingButtonContainer>
        <BookingButton 
          onClick={selectedRoom !== 0 ? onBookingClick : undefined}
          disabled={selectedRoom === 0}
        >
          {isBookingVisible ? '닫기' : '예약하기'}
        </BookingButton>
      </BookingButtonContainer>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>시간</th>
              {weekDays.map((day, index) => (
                <th key={index}>
                  {day} <br />
                  {dates[index].toLocaleDateString('ko-KR', { 
                    month: '2-digit', 
                    day: '2-digit'
                  }).replace(/\. /g, '-').replace('.', '')} {/* 모든 마침표 제거 */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, timeIndex) => (
              <tr key={timeIndex}>
                <Td>{time}</Td>
                {weekDays.map((_, dayIndex) => {
                  const meeting = meetings.find((m) => {
                    const meetingStart = new Date(m.starttime);
                    const meetingEnd = new Date(m.endtime);
                    const meetingDay = meetingStart.getDay();
                    const meetingHourStart = meetingStart.getHours();
                    const meetingMinuteStart = meetingStart.getMinutes();
                    const meetingHourEnd = meetingEnd.getHours();
                    const meetingMinuteEnd = meetingEnd.getMinutes();

                    const slotHour = parseInt(time.split(":")[0], 10);
                    const slotMinute = parseInt(time.split(":")[1], 10);

                    const slotTime = slotHour * 60 + slotMinute;
                    const startTime = meetingHourStart * 60 + meetingMinuteStart;
                    const endTime = meetingHourEnd * 60 + meetingMinuteEnd;

                    return meetingDay - 1 === dayIndex && startTime <= slotTime && endTime > slotTime;
                  });

                  return (
                    <Td
                      key={dayIndex}
                      meetingId={meeting?.id}
                      hasMeeting={!!meeting}
                      onClick={() => meeting && onMeetingClick(meeting.id)}
                    >
                      {meeting ? <MeetingTitle>{meeting.title}</MeetingTitle> : null}
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default MeetingRoomBooked;
