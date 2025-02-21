import React, { useState } from "react";
import styled from "styled-components";

const ProjectContainer = styled.div`
  margin: 20px;
  max-width: 500px;
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;

  h3 {
    margin: 0 0 15px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #eef2f6;
    font-size: 1.2rem;
    color: #274c77;
  }
`;

const ProjectItem = styled.li`
  padding: 15px;
  margin: 12px 0;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  background-color: #fcfcfd;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  div {
    margin-bottom: 10px;
    
    &:first-child {
      strong {
        font-size: 1rem;
        color: #2d3748;
      }
      
      em {
        color: #718096;
        font-style: normal;
        margin-left: 8px;
      }
    }

    &:nth-child(2) {
      color: #4a5568;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }
  }
`;

const Button = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1b3a57;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  }
`;

const Pagination = styled.div`
  margin-top: 20px;
  padding-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid #eef2f6;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CreateButton = styled.button`
  background-color: #274c77;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1b3a57;
  }
`;

const ProjectListWidget = ({ projects, onProjectSelect, onMeetingDetailsSelect, onCreateProject }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;

  const sortedProjects = [...projects]
    .sort((a, b) => new Date(a.duedate) - new Date(b.duedate))
    .slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const handleNext = () => {
    if (currentPage < Math.ceil(projects.length / projectsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <ProjectContainer>
      <HeaderContainer>
        <h3>진행중인 프로젝트</h3>
        <CreateButton onClick={onCreateProject}>
          프로젝트 생성하기
        </CreateButton>
      </HeaderContainer>

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {sortedProjects.length === 0 ? (
          <li>진행 중인 프로젝트가 없습니다.</li>
        ) : (
          sortedProjects.map((project) => (
            <ProjectItem key={project.id}>
              <div>
                <strong>{project.name}</strong> - <em>마감일: {new Date(project.duedate).toLocaleDateString()}</em>
              </div>
              <div>참여자: {project.participants.map((participant) => participant.name).join(", ")}</div>
              <Button onClick={() => onProjectSelect(project.id)}>상세보기</Button> {/* 상세보기 버튼 */}
              <Button onClick={() => onMeetingDetailsSelect(project.id)}>회의내역 보기</Button> {/* 회의내역 보기 버튼 */}
            </ProjectItem>
          ))
        )}
      </ul>
      <Pagination>
        <Button onClick={handlePrevious} disabled={currentPage === 1}>
          이전
        </Button>
        <Button onClick={handleNext} disabled={currentPage === Math.ceil(projects.length / projectsPerPage)}>
          다음
        </Button>
      </Pagination>
    </ProjectContainer>
  );
};

export default ProjectListWidget;
