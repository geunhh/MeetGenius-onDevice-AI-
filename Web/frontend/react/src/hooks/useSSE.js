import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate
const baseURL = import.meta.env.VITE_APP_BASEURL;

const useSSE = (meetingId) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null); // 데이터를 저장할 상태

    useEffect(() => {
        console.log("✅ SSE 연결 시작");
        const sse = new EventSource(`${baseURL}/meetings/stream/`);

        sse.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data);
                console.log("📩 수신된 데이터:", parsedData);
                setData(parsedData); // 상태 업데이트

            } catch (error) {
                console.error("❌ [SSE] 메시지 처리 오류:", error);
            }
        };

        return () => {
            console.log("🚪 SSE 연결 해제");
            sse.close();
        };
    }, [navigate, meetingId]);

    return { data }; // data 반환
};

export default useSSE;
