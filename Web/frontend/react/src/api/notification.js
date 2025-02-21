import axiosInstance from "./axiosInstance"; // Axios 인스턴스 가져오기
import { setNotifications, markAsReadInStore } from "../redux/notificationSlice"; // 리덕스 액션 가져오기
import { useDispatch } from 'react-redux';


// ✅ 알림 가져오는 비동기 함수
export const getNotifications = async (dispatch) => {
  try {
    const response = await axiosInstance.get("/accounts/notifications/unread/");
    dispatch(setNotifications(response.data)); // 리덕스로 알림 데이터 설정
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error.response?.data || "오류";
  }
};

// ✅ 알림 읽음 처리 함수
export const markAsRead = async (notification_id, dispatch) => {
  try {
    await axiosInstance.post(`/accounts/notifications/mark_as_read/${notification_id}/`);

    // 읽음 처리 후 클라이언트 상태 업데이트
    dispatch(markAsReadInStore(notification_id)); // 리덕스로 읽음 처리
    // setUnreadCount((prev) => prev - 1);
  } catch (error) {
    console.error("알림 읽음 처리 실패:", error);
  }
};

