import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addMeeting } from "../redux/meetingSlice"; // 리덕스 액션 import
import { getNotifications, markAsRead } from "../api/notification"; // 알림 관련 함수
import { fetchParticipants } from "../api/meetingRoom"; // 알림 관련 함수
import { fetchProjects } from "../api/project"; // 알림 관련 함수
import { fetchUserInfo } from "../api/userApi"; // 알림 관련 함수
import axios from "axios";
import styled from "styled-components";

// 스타일 컴포넌트 설정
const MeetingFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  width: calc(100% - 30px);
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

  h3 {
    margin: 0 0 15px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eef2f6;
    font-size: 1.1rem;
    color: #274c77;
  }

  h4 {
    margin: 8px 0;
    font-size: 0.95rem;
    color: #2d3748;
  }
`;

const InputField = styled.input`
  width: calc(100% - 16px); // 패딩을 고려한 너비 조정
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #e8ecef;
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #274c77;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #e8ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
`;

const UserSelectContainer = styled.div`
  margin-bottom: 15px;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 5px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  margin-bottom: 5px;
  border-radius: 5px;
  background-color: #f8f9fa;
  font-size: 0.85rem;

  label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.85rem;
    color: #4a5568;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    margin-left: 6px;
  }

  .user-name {
    font-weight: 500;
  }

  .user-position {
    font-size: 0.8rem;
    color: #718096;
  }

  input[type="checkbox"] {
    margin-right: 6px;
    transform: scale(0.9);
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1b3a57;
    transform: translateY(-1px);
  }
`;

const AgendaContainer = styled.div`
  margin-bottom: 15px;
`;

const baseURL = import.meta.env.VITE_APP_BASEURL;

const MeetingRoomCreateWidget = ({roomId}) => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [agendas, setAgendas] = useState([{title: "" }]);
  const [meetingDay, setMeetingDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState(null);

  
  const dispatch = useDispatch(); // 리덕스 디스패치 사용

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 비동기 함수 결과를 기다리고, 데이터를 가져온 후 상태 업데이트
        const usersData = await fetchUserInfo();  // 사용자 정보 가져오기
        console.log("회원 목록입니다.", usersData);
        setUsers(usersData);  // 사용자 목록 상태 업데이트
  
        const projectsData = await fetchProjects();  // 프로젝트 목록 가져오기
        console.log("프로젝트 목록입니다", projectsData);
        setProjects(projectsData);  // 프로젝트 목록 상태 업데이트
      } catch (error) {
        console.error("데이터를 불러오는 데 실패했습니다.", error);
      }
    };
  
    fetchData();  // 비동기 함수 호출
  }, []);  // 빈 배열로 처음 한 번만 실행되도록 설정

  // 프로젝트 이름 변경 시 참가자 가져오기
  useEffect(() => {
    const fetchParticipantsData = async () => {
      if (projectName) {
        try {
          const projectParticipant = await fetchParticipants(projectName);
          // 데이터가 존재하는지 확인
          if (projectParticipant && Array.isArray(projectParticipant)) {
            setParticipants(
              projectParticipant.map(({ participant, authority }) => ({
                id: participant,  // participant -> id 변경
                authority,        // authority 값 유지
              }))
            );
          } else {
            setError("참여자 목록이 올바르지 않습니다.");
            return; // 오류 발생 시 추가 작업 방지
          }
        } catch (error) {
          setError("참여자 목록을 불러오는 데 실패했습니다.");
          console.error("참여자 목록 불러오기 오류:", error);
        }
      }
    };

    fetchParticipantsData(); // 데이터 불러오기 호출
  }, [projectName]); // 프로젝트 이름이 변경될 때마다 실행

  // 안건 변경 핸들러
  const handleAgendaChange = (index, value) => {
    const updatedAgendas = [...agendas];
    updatedAgendas[index].title = value;
    setAgendas(updatedAgendas);
  };

  // 새로운 안건 추가 핸들러
  const addAgenda = () => {
    const lastAgenda = agendas[agendas.length - 1];
    
    // 마지막 안건의 title이 비어있지 않으면 새로운 안건 추가
    if (lastAgenda && lastAgenda.title.trim() !== "") {
      setAgendas([...agendas, { title: "" }]);
    } else {
      alert("안건 제목을 입력한 후 추가해 주세요.");
    }
  };

  // 회의 예약 핸들러
  const handleCreateMeeting = async (roomId) => {
    const authToken = localStorage.getItem("authToken");    
    if (!roomId) {
      alert("예약할 회의실 번호를 선택해주세요");
      return;
    }
    if (!authToken) {
      alert("로그인된 사용자만 회의를 예약할 수 있습니다.");
      return;
    }

    if (!meetingTitle || !meetingDay || !startTime || !endTime || !projectName) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }
    console.log("roomId", roomId)
    const formData = {
      room: roomId,
      title: meetingTitle,
      project_name: projectName,
      meetingday : meetingDay,
      starttime : startTime +":00" ,
      endtime : endTime +":00",
      participants: participants.map((p) => ({
        id: p.id,
        authority: p.authority,
      })),
      agenda_items: agendas.map((a) => ({
        title: a.title,
      })),
    };
    
    try {
      const response = await axios.post(
        `${baseURL}/meetingroom/book/${roomId}/`,
        formData,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      alert("회의가 예약되었습니다.");
      // 회의 목록에 새로 예약된 회의 추가
      console.log("회의 예약 데이터:", formData); // 여기에 상태 데이터를 출력하여 문제의 원인 확인      
      dispatch(addMeeting(response.data));
      await getNotifications(dispatch); // 회의 생성 후 알림 갱신

    } catch (error) {
      console.error("🔴 회의 예약 실패:", error);
  
      const errorMessage = error.response?.data?.message || "알 수 없는 오류";
      
      alert(`회의 예약 실패: ${errorMessage}`);
    }
  };
// 참여자 선택 핸들러
const handleUserSelect = (userId) => {
  setParticipants((prevParticipants) => {
    const isSelected = prevParticipants.some((p) => p.id === userId);
    if (isSelected) {
      return prevParticipants.filter((p) => p.id !== userId);
    } else {
      return [...prevParticipants, { id: userId, authority: 1 }];
    }
  });
};

// 권한 변경 핸들러 (0 ↔ 1 토글)
const handleAuthorityChange = (userId) => {
  setParticipants((prevParticipants) =>
    prevParticipants.map((p) =>
      p.id === userId ? { ...p, authority: p.authority === 0 ? 1 : 0 } : p
    )
  );
};
// startTime, endTime에 30분 단위만 입력 가능하도록 처리
const startTimeOptions = [];
for (let hour = 9; hour < 18; hour++) { // 9시부터 18시까지
  startTimeOptions.push(`${hour}:00`);
  startTimeOptions.push(`${hour}:30`);
}

// 종료 시간 옵션을 별도로 설정
const endTimeOptions = [];
for (let hour = 9; hour <= 18; hour++) {
  if (hour === 9) {
    endTimeOptions.push(`${hour}:30`);
    continue; // 18:00까지만 선택 가능
  }
  if (hour === 18) {
    endTimeOptions.push(`${hour}:00`);
    break; // 18:00까지만 선택 가능
  }
  endTimeOptions.push(`${hour}:00`);
  endTimeOptions.push(`${hour}:30`);
}


  return (
    <MeetingFormContainer>
      <h3>회의 예약</h3>

      <SelectField
        value={projectName}
        onChange={(e) => {
          setProjectName(e.target.value);
        }}
      >
        <option value="">프로젝트 선택</option>
        {projects.map((project) => (
          <option key={project.id} value={project.name}>
            {project.name}
          </option>
        ))}
      </SelectField>



      <InputField
        type="text"
        placeholder="회의 제목"
        value={meetingTitle}
        onChange={(e) => setMeetingTitle(e.target.value)}
      />

      <InputField
        type="date"
        value={meetingDay}
        onChange={(e) => setMeetingDay(e.target.value)}
      />

{/* 30분 단위 시간 선택 */}
<SelectField
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
    >
      <option value="">시작 시간 선택</option>
      {startTimeOptions.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </SelectField>

    {/* 종료 시간 선택 (시작 시간 이후만 선택 가능) */}
    <SelectField
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
    >
      <option value="">종료 시간 선택</option>
      {startTime && endTimeOptions.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </SelectField>


      <h4>안건</h4>
      {agendas.map((agenda, index) => (
        <InputField
          key={index}
          type="text"
          placeholder={`안건`}
          value={agenda.title}
          onChange={(e) => handleAgendaChange(index, e.target.value)}
        />
      ))}
      <Button onClick={addAgenda}>안건 추가</Button>

      <UserSelectContainer>
        <h4>참여자 선택</h4>
        {users.map((user) => (
          <UserItem key={user.id}>
            <label>
              <input
                type="checkbox"
                value={user.id}
                checked={participants.some((p) => p.id === user.id)}
                onChange={() => handleUserSelect(user.id)}
              />
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-position">({user.department} / {user.position})</span>
              </div>
            </label>
            <div>
              <label>
                마스터
                <input
                  type="checkbox"
                  checked={participants.some((p) => p.id === user.id && p.authority === 0)}
                  onChange={() => handleAuthorityChange(user.id)}
                />
              </label>
            </div>
          </UserItem>
        ))}
      </UserSelectContainer>

      <Button onClick={() => handleCreateMeeting(roomId)}>회의 예약</Button>
      </MeetingFormContainer>
  );
};

export default MeetingRoomCreateWidget;
