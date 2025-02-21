// ToDoWidget.jsx

import React from "react";
import styled from "styled-components";

// ✅ ToDoWidget 컨테이너 스타일링
const ToDoWidgetContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 330px;
  margin-top: 20px;
`;

const TaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TaskText = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const TaskProgress = styled.div`
  display: flex;
  gap: 5px;
`;

const ProgressBar = styled.div`
  width: 20px;
  height: 5px;
  border-radius: 2px;
  background-color: ${({ progress }) => (progress ? "#FFB800" : "#D3D3D3")};
`;

const ViewAllButton = styled.a`
  display: inline-block;
  margin-top: 10px;
  font-size: 12px;
  color: #007bff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ToDoWidget = () => {
  return (
    <ToDoWidgetContainer>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '0' }}>To-Do List</h3>
      <TaskContainer>
        <TaskItem>
          <TaskText>Create wireframes</TaskText>
          <TaskProgress>
            <ProgressBar progress={true} />
            <ProgressBar progress={true} />
            <ProgressBar progress={false} />
          </TaskProgress>
        </TaskItem>

        <TaskItem>
          <TaskText>Create light and dark mode</TaskText>
          <TaskProgress>
            <ProgressBar progress={true} />
            <ProgressBar progress={true} />
            <ProgressBar progress={false} />
          </TaskProgress>
        </TaskItem>

        <TaskItem>
          <TaskText>Create wireframes</TaskText>
          <TaskProgress>
            <ProgressBar progress={true} />
            <ProgressBar progress={false} />
            <ProgressBar progress={false} />
          </TaskProgress>
        </TaskItem>

        <TaskItem>
          <TaskText>Create light and dark mode</TaskText>
          <TaskProgress>
            <ProgressBar progress={true} />
            <ProgressBar progress={true} />
            <ProgressBar progress={true} />
          </TaskProgress>
        </TaskItem>
      </TaskContainer>

      <ViewAllButton href="#">View all</ViewAllButton>
    </ToDoWidgetContainer>
  );
};

// `default`로 export
export default ToDoWidget;
