import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { fetchMeetingByProjcet } from "../api/project";
import { fetchMomsByMeetings } from "../api/meetingRoom";

const ProjectMomContainer = styled.div`
  margin: 20px;
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  box-sizing: border-box;
`;

const ProjectMomItem = styled.li`
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
  
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 12px;
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    background-color: #1b3a57;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Pagination = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
`;

const ProjectMom = ({ projectId }) => {
  const navigate = useNavigate(); // navigate 정의
  const [meetingList, setMeetingList] = useState([]);
  const [meetingMomList, setMeetingMomList] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  // 회의 데이터 가져오기
  const fetchMeetings = async () => {
    try {
      const meetings = await fetchMeetingByProjcet(projectId);
      setMeetingList(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMeetings();
    }
  }, [projectId]);

  // 최신순 정렬 후 페이징 적용
  const sortedMeetings = [...meetingList]
    .sort((a, b) => new Date(b.starttime) - new Date(a.starttime))
    .slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const handleNext = () => {
    if (currentPage < Math.ceil(meetingList.length / projectsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <ProjectMomContainer>
      <h3>회의 내역</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {sortedMeetings.length === 0 ? (
          <li>진행한 회의가 없습니다.</li>
        ) : (
          sortedMeetings.map((meeting) => (
            <ProjectMomItem key={meeting.id}>
              <div>
                <strong>{meeting.title}</strong> -{" "}
                <em>회의시간: {new Date(meeting.starttime).toLocaleDateString()}</em>
              </div>
              <div>
                참여자:{" "}
                {meeting.participants
                  .map((participant) => participant.participant_name)
                  .join(", ")}
              </div>
              
              <ButtonContainer>
                <Button onClick={() => window.open(`/mom-summary/${meeting.id}`, '_blank')}>
                  요약된 회의록 보기
                </Button>
                <Button onClick={() => window.open(`/momedit/${meeting.id}`, '_blank')}>
                  회의록 수정하기
                </Button>
              </ButtonContainer>

              {/* 회의록 표시 */}
              {meetingMomList[meeting.id] && (
                <div style={{ marginTop: "10px", padding: "10px", background: "#f0f0f0", borderRadius: "5px" }}>
                  <strong>회의록 내용:</strong>
                  <p>{meetingMomList[meeting.id]}</p>
                </div>
              )}
            </ProjectMomItem>
          ))
        )}
      </ul>
      
      {/* 페이지네이션 */}
      <Pagination>
        <Button onClick={handlePrevious} disabled={currentPage === 1}>
          이전
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentPage === Math.ceil(meetingList.length / projectsPerPage)}
        >
          다음
        </Button>
      </Pagination>
    </ProjectMomContainer>
  );
};

export default ProjectMom;
