import React, { useState, useEffect } from "react";
import styled from "styled-components";

const RealtimeDoc = ({ meetingInfo, documents, meetingId  }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docList, setDocList] = useState([]);

  // ✅ 문서를 로컬 스토리지에서 복원
  useEffect(() => {
    const savedDocs = localStorage.getItem(`meeting_${meetingId}_documents`);
    if (savedDocs) {
      setDocList(JSON.parse(savedDocs));
      console.log("📂 로컬 스토리지에서 문서 복원:", JSON.parse(savedDocs));
    }
  }, [meetingId]);

  // ✅ 새로운 문서가 들어오면 중복 제거 후 업데이트 + 로컬 스토리지 저장
  useEffect(() => {
    if (documents.length > 0) {
      setDocList(prevDocs => {
        const newDocs = documents.filter(newDoc => !prevDocs.some(doc => doc.id === newDoc.id));
        if (newDocs.length > 0) {
          const updatedDocs = [...prevDocs, ...newDocs];
          localStorage.setItem(`meeting_${meetingId}_documents`, JSON.stringify(updatedDocs));
          return updatedDocs;
        }
        return prevDocs;
      });

      // ✅ 항상 첫 번째 문서를 펼치도록 보장
      setSelectedDoc(documents[0]);
    }
  }, [documents, meetingId]);


  const handleDocClick = (doc) => {
    if (selectedDoc?.id === doc.id) {
      setSelectedDoc(null);
    } else {
      setSelectedDoc(doc);
    }
  };

  return (
    <DocContainer>
      <DocList>
        {docList.length > 0 ? (
          docList.map((doc, index) => (
            <DocItem
              key={doc.id || index}
              onClick={() => handleDocClick(doc)}
              isSelected={selectedDoc?.id === doc.id}
            >
              <DocTitle>{doc.title}</DocTitle>
              {selectedDoc?.id === doc.id && (
                <DocContent>{doc.content}</DocContent>
              )}
            </DocItem>
          ))
        ) : (
          <p>📂 문서가 없습니다.</p>
        )}
      </DocList>
    </DocContainer>
  );
};

// Styled Components
const DocContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
`;

const DocList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DocItem = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #274c77;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: white;
    border-color: #274c77;
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(39, 76, 119, 0.1);

    &::before {
      opacity: 1;
    }
  }
`;

const DocTitle = styled.h3`
  margin: 0;
  padding-bottom: 8px;
  font-size: 16px;
  color: #1a202c;
  font-weight: 600;
  line-height: 1.4;
  border-bottom: 1px solid #e2e8f0;
`;

const DocContent = styled.p`
  margin: 0;
  padding-top: 16px;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
`;

export default RealtimeDoc;
