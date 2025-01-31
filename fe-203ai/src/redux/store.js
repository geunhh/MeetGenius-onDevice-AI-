import { configureStore } from "@reduxjs/toolkit"; // Redux 스토어 생성 함수 가져오기
import authReducer from "./authSlice"; // authSlice에서 생성한 리듀서 가져오기

// Redux 스토어 설정
export const store = configureStore({
  reducer: {
    auth: authReducer, // authSlice 리듀서를 auth 상태로 등록
  },
});

export default store;

