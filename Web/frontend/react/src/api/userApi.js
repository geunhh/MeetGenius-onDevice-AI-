import axiosInstance from "./axiosInstance";

// ✅ 사용자 정보 가져오기 (부서명 포함)
export const fetchUserInfo = async () => {
  try {
    const response = await axiosInstance.get("/accounts/users/");
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch user info";
  }
};


  // 부서 목록 불러오기
  export  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get(`/accounts/departments/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch user info";
    }
  };
