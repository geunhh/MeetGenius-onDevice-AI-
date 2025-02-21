import axiosInstance from "./axiosInstance"; // Axios 인스턴스 가져오기

// ✅ 프로젝트 삭제 함수
export const deleteProject = async (projectId) => {
  try {
    const response = await axiosInstance.delete(`/projects/${projectId}/`);
    return response?.data?.message || "프로젝트가 삭제되었습니다.";

  } catch (error) {
    throw new Error(error.response?.data?.message || "프로젝트 삭제에 실패했습니다.");
  }
};

// ✅ 문서서 삭제 함수
export const deleteReport = async (projectId, ReportId) => {
    try {
      const response = await axiosInstance.delete(`/projects/${projectId}/${ReportId}/`);
      return response?.data?.message || "문서가 삭제되었습니다.";
  
    } catch (error) {
      throw new Error(error.response?.data?.message || "문서서 삭제에 실패했습니다.");
    }
  };

 // 프로젝트 목록을 가져오는 함수
  export  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get(`/projects/`);
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message ||"프로젝트 목록을 불러오는 데 실패했습니다.");
    }
  };
  
  export const fetchFiles = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/all_reports/`);
      return response.data;
     } catch (error) {
      throw new Error(error.response?.data?.message ||"프로젝트 목록을 불러오는 데 실패했습니다.");
    }
  };

  // 프로젝트별 회의 목록
  export const fetchMeetingByProjcet = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/meetingroom/meetings_by_project/${projectId}/`);
      return response.data;
     } catch (error) {
      throw new Error(error.response?.data?.message ||"회의 목록을 불러오는 데 실패했습니다.");
    }
  };

