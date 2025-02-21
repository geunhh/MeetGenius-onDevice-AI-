import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMeetingDetails, fetchMomsByMeetings, patchMom } from "../api/meetingRoom";
import styled from "styled-components";

// 🌟 전체 페이지 스타일 (A4 문서 느낌)
const PageWrapper = styled.div`
  width: 100vw;
  padding: 50px 0;
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: center;
  background-color: #f0f0f0;
  overflow-y: auto; /* 페이지가 스크롤 가능하도록 */
`;

const Container = styled.div`
  width: 794px; /* A4 용지 너비 */
  height: 1123px; /* A4 용지 높이 */
 
  margin-bottom: 20px;
  padding: 40px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  font-family: "Arial", sans-serif;
  line-height: 1.8;
  text-align: left;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #1a1a1a;
`;

const Info = styled.p`
  font-size: 14px;
  color: #555;
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 10px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
`;

const Content = styled.p`
  font-size: 16px;
  color: #333;
  margin-top: 10px;
`;

const MomContainer = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Footer = styled.div`
  text-align: right;
  font-size: 14px;
  color: #777;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.5;
  resize: none; /* 스크롤 방지 */
  min-height: 780px; /* 충분히 큰 입력란 */
  box-sizing: border-box;
`;

const SubmitButton = styled.button`
  background-color: #F8BB15;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  align-self: flex-end;

  &:hover {
    background-color: rgb(255, 218, 115);
  }

  &:focus {
    outline: none;
  }
`;


const MomEditPage = () => {
  const { meetingId } = useParams();
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [meetingMoms, setMeetingMoms] = useState([]);
  const [editedMoms, setEditedMoms] = useState([]); // 수정된 moms 상태

  // 회의록 및 안건 목록을 가져오는 함수
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const meetingDetail = await fetchMeetingDetails(meetingId);
        setMeetingDetails(meetingDetail);

        const moms = await fetchMomsByMeetings(meetingId);
        setMeetingMoms(moms);

        // 초기 상태 설정 (agenda_result를 빈 문자열로 초기화)
        setEditedMoms(moms.map((mom) => ({
          id: mom.id,
          agenda_result: mom.agenda_result || "",
        })));
      } catch (error) {
        console.error("회의 상세 정보를 불러오는 중 오류 발생:", error);
      }
    };

    if (meetingId) {
      fetchDetails();
    }
  }, [meetingId]);

  // 입력값 변경 시 상태 업데이트
  const handleChange = (id, value) => {
    setEditedMoms((prev) =>
      prev.map((mom) =>
        mom.id === id ? { ...mom, agenda_result: value } : mom
      )
    );
  };

  const handleSubmit = () => {
    // moms 배열을 momsToSubmit 객체로 감싸기
    const momsToSubmit = {
      "moms": editedMoms.map((mom) => ({
        id: mom.id,
        agenda_result: mom.agenda_result,
      })),
    };
    console.log("Modified Moms:", momsToSubmit);
  
    // 예시: 서버로 제출
    patchMom(meetingId, momsToSubmit);
  };
  if (!meetingDetails) return <PageWrapper><Container>회의록을 불러오는 중...</Container></PageWrapper>;

  return (
    <PageWrapper>
      {/* 전체 컨테이너로 여러 안건을 처리 */}
      {meetingMoms.length > 0 ? (
        meetingMoms.map((mom, index) => (
          <Container key={mom.id}>
            <Header>
              <div>
                <Title>{meetingDetails.title}</Title>
                <Info>
                  참여자:{" "}
                  {meetingDetails.meeting_participants
                    ?.map((participant) => participant.name)
                    .join(", ") || "정보 없음"}
                </Info>
              </div>
              <Info>
                Date: {new Date(meetingDetails.starttime).toLocaleDateString()}
              </Info>
            </Header>

            {/* 안건 목록 */}
            <MomContainer>
              <SectionTitle><strong>안건: </strong> {mom.agenda.title}</SectionTitle>

              {/* 수정 가능한 텍스트 입력 폼 */}
              <Textarea
                value={
                  editedMoms.find((editedMom) => editedMom.id === mom.id)
                    ?.agenda_result || ""
                }
                onChange={(e) => handleChange(mom.id, e.target.value)}
              />
            </MomContainer>

             {/* 마지막 안건에서만 제출 버튼 표시 */}
             <Footer>
              {index === meetingMoms.length - 1 ? (
                <>
                  <Logo src="/203ai_logo.png" alt="203ai Logo" />
                  <SubmitButton onClick={handleSubmit}>수정된 내용 제출</SubmitButton>
                </>
              ) : (
                <Logo src="/203ai_logo.png" alt="203ai Logo" />
              )}
            </Footer>
          </Container>
        ))
      ) : (
        <Content>등록된 안건이 없습니다.</Content>
      )}
    </PageWrapper>
  );
};

export default MomEditPage;