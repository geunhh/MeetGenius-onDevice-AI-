import React from "react";
import styled from "styled-components";

// ✅ 공지사항 위젯 스타일링
const NoticeWidgetContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px; /* 가로 길이 400px로 설정 */
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 12px;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 8px;
  background-color: #f4f4f4;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 8px;
  border-top: 1px solid #ddd;
  font-size: 12px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const NoticeWidget = () => {
  return (
    <NoticeWidgetContainer>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '0' }}>Notice</h3>
      <Table>
        <thead>
          <tr>
            <TableHeader>Title</TableHeader>
            <TableHeader>Views</TableHeader>
            <TableHeader>Action</TableHeader>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TableCell>On-Device AI for Smarter Meetings, Jetson is Here!</TableCell>
            <TableCell>204</TableCell>
            <TableCell><ActionButton>More Detail</ActionButton></TableCell>
          </tr>
          <tr>
            <TableCell>How to place order from outside India?</TableCell>
            <TableCell>185</TableCell>
            <TableCell><ActionButton>More Detail</ActionButton></TableCell>
          </tr>
          <tr>
            <TableCell>Where is my order, the tracking says it is..</TableCell>
            <TableCell>145</TableCell>
            <TableCell><ActionButton>More Detail</ActionButton></TableCell>
          </tr>
          <tr>
            <TableCell>My credit card has been charged with 24..</TableCell>
            <TableCell>86</TableCell>
            <TableCell><ActionButton>More Detail</ActionButton></TableCell>
          </tr>
        </tbody>
      </Table>
      <a href="#" style={{ fontSize: '12px', color: '#007bff' }}>OVERVIEW &gt;</a>
    </NoticeWidgetContainer>
  );
};

export default NoticeWidget;
