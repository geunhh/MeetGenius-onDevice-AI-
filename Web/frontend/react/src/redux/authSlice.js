import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance"; // Axios 인스턴스 가져오기

// ✅ 로그인 요청 (비동기 Thunk)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ employeeNumber, password }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/accounts/login/", // Django 로그인 API 엔드포인트
        {
          employee_number: employeeNumber,
          password,
        }
      );

      return response.data; // 로그인 성공 시 유저 데이터 반환
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// ✅ 로그아웃 요청 (비동기 Thunk)
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    // 로컬 스토리지에서 토큰을 가져옵니다.
    const authToken = localStorage.getItem("authToken");

    // 토큰이 없다면 로그아웃할 수 없습니다.
    if (!authToken) {
      throw new Error("No valid auth token found");
    }

    // 로그아웃 요청을 보냅니다. Authorization 헤더에 토큰을 포함
    await axiosInstance.post("/accounts/logout/", {}, {
      headers: {
        "Authorization": `Token ${authToken}`,
      },
    });

    // 로그아웃 후 토큰 삭제
    localStorage.removeItem("authToken");
    return;
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error.response?.data || "로그아웃 실패";
  }
});

// ✅ 로그인 유지 (세션 정보 가져오기)
export const loadUser = createAsyncThunk("auth/loadUser", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/accounts/user/");
    return response.data; // 현재 로그인된 유저 정보 반환
  } catch (error) {
    return thunkAPI.rejectWithValue(null); // 로그인 정보 없으면 null 반환
  }
});

// ✅ 초기 상태 정의
const initialState = {
  user: null, // 현재 로그인한 사용자 정보
  isAuthenticated: localStorage.getItem("authToken") ? true : false, // 초기 상태에서 로컬스토리지의 토큰 여부로 인증 상태 결정
  authToken: localStorage.getItem("authToken") || null, // 로컬스토리지에서 토큰 불러오기
  isLoading: false, // 로딩 상태
  error: null, // 에러 메시지 저장
};

// ✅ 인증 상태 변경 액션 (setAuthenticated)
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload; // 인증 상태 변경
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload; // 유저 정보를 저장 (token 포함)
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem("authToken", action.payload.token); // 로그인 성공 시 토큰 저장
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload; // 실패한 에러 메시지
      })

      // 로그아웃 처리
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.authToken = null;
        localStorage.removeItem("authToken"); // 로그아웃 시 토큰 삭제
      })

      // 로그인 유지 (세션 체크)
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload; // 로그인된 유저 정보
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

// `setAuthenticated` 액션 export
export const { setAuthenticated } = authSlice.actions;

export default authSlice.reducer;
