import { configureStore } from "@reduxjs/toolkit"; // Redux 스토어 생성 함수 가져오기
import authReducer from "./authSlice"; // authSlice에서 생성한 리듀서 가져오기
import projectReducer from "./projectSlice"; // projectSlice에서 생성한 리듀서 가져오기
import meetingReducer from "./meetingSlice";
import notificationReducer from './notificationSlice';

// Redux 스토어 설정
export const store = configureStore({
  reducer: {
    auth: authReducer, // authSlice 리듀서를 auth 상태로 등록
    projects: projectReducer, // 프로젝트 관리 리듀서 추가
    meetings: meetingReducer,
    notifications: notificationReducer, // 알림 리듀서 추가
  },
});

export default store;
