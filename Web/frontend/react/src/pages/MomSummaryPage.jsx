import React from "react";
import { useParams } from "react-router-dom";  // ✅ useParams 사용


const MomSummaryPage = () => {
    const { meetingId } = useParams();  // ✅ URL에서 meetingId 가져오기

    return (

        <div>
        <p>요약 회의록 페이지</p>
        <p>현재 회의 ID: {meetingId}</p> {/* ✅ meetingId 출력 */}
        </div>
    );
};


export default MomSummaryPage;
