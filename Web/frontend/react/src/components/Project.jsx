import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ProjectCreateWidget from "./ProjectCreateWidget";
import ProjectListWidget from "./ProjectListWidget";
import ProjectMom from "./ProjectMom";
import { useDispatch, useSelector } from "react-redux";
import { setProjects } from "../redux/projectSlice";
import { fetchProjects } from "../api/project";
import ProjectDetail from "./ProjectDetail";

const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  max-width: 1000px;
  margin: 20px auto 0;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 25px;
  width: 100%;
`;

const ProjectSidePanel = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
`;

const CreateProjectButton = styled.button`
  padding: 8px 16px;
  margin-bottom: 15px;
  background-color: #274c77;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: #1b3a57;
  }
`;

const Project = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects.list); // 리덕스에서 프로젝트 목록 가져오기
  const [isCreateVisible, setIsCreateVisible] = useState(false); // 생성하기 위젯 보이기 여부
  const [selectedProject, setSelectedProject] = useState(null); // 선택된 프로젝트 ID
  const [selectedMeetingProject, setSelectedMeetingProject] = useState(null); // 선택된 회의 프로젝트 ID

  useEffect(() => {
    const getProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        dispatch(setProjects(projectsData)); // 리덕스에 프로젝트 목록 설정
      } catch (error) {
        console.error("프로젝트 목록 불러오기 오류:", error);
      }
    };

    getProjects(); // 프로젝트 목록 가져오기
  }, [dispatch]);

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId); // 선택된 프로젝트 ID 설정
    setIsCreateVisible(false); // 생성 위젯을 숨기기
    setSelectedMeetingProject(null); // 회의내역 숨기기
  };

  const handleMeetingDetailsSelect = (projectId) => {
    setSelectedMeetingProject(projectId); // 회의 프로젝트 ID 설정
    setSelectedProject(null); // 상세보기 숨기기
  };
  
  const closeProjectDetail = () => {
    setSelectedProject(null); // 프로젝트 상세보기 닫기
  };

  const handleCreateProjectToggle = () => {
    setIsCreateVisible((prev) => !prev); // 프로젝트 생성 폼 토글
    setSelectedProject(null); // 상세보기 숨기기
    setSelectedMeetingProject(null); // 회의내역 숨기기
  };

  return (
    <ProjectContainer>
      {/* <h2>프로젝트 관리</h2> */}
      <ContentWrapper>
        <ProjectListWidget
          projects={projects}
          onProjectSelect={handleProjectSelect}
          onMeetingDetailsSelect={handleMeetingDetailsSelect}
          onCreateProject={handleCreateProjectToggle}
        />

        {/* 사이드 패널은 조건부 렌더링 */}
        {(isCreateVisible || selectedProject || selectedMeetingProject) && (
          <ProjectSidePanel>
            {/* 생성하기 위젯이 보일 때 */}
            {isCreateVisible && <ProjectCreateWidget closeCreateProject={handleCreateProjectToggle} />}

            {/* 상세보기 위젯이 보일 때 */}
            {selectedProject && !isCreateVisible && (
              <ProjectDetail projectId={selectedProject} onClose={closeProjectDetail} />
            )}

            {/* 회의내역 보기 */}
            {selectedMeetingProject && !isCreateVisible && (
              <div>
                <ProjectMom projectId={selectedMeetingProject} />
              </div>
            )}
          </ProjectSidePanel>
        )}
      </ContentWrapper>
    </ProjectContainer>
  );
};

export default Project;
