import axios from 'axios';
import { useDispatch } from "react-redux";
import { setMeetings } from "../redux/meetingSlice"; // 리덕스 액션
import axiosInstance from "./axiosInstance";

// API 기본 URL 설정
const baseURL = import.meta.env.VITE_APP_BASEURL;

// 회의 목록을 가져오는 함수
export const fetchMeetings = async (roomId, startdate, enddate) => {
    const authToken = localStorage.getItem("authToken");
    const url = roomId
    ? `${baseURL}/meetingroom/book/${roomId}/`  // 특정 회의실에 대한 회의 예약 목록
    : `${baseURL}/meetingroom/mymeeting/`;  // 내 회의 예약 목록
    // startdate와 enddate가 없으면 생략
    const params = {};
    if (startdate !== null) params.startdate = startdate;
    if (enddate !== null) params.enddate = enddate;
    
  try {
    const response = await axios.get(url, {
      params: { startdate, enddate },
      headers: {
        Authorization: `Token ${authToken}`, // 토큰을 헤더에 추가
      },
    });
    console.log("회의 목록 조회",response.data)
    return response.data;  // 회의 데이터 반환
  } catch (error) {
    console.error("회의 목록을 불러오는 데 실패했습니다.", error);
    throw error;  // 에러를 던져서 호출한 곳에서 처리하도록 함
  }
};

// 예약 취소 함수
export const deleteMeetingRoomBooking = async (meetingId) => {
  try {
    const response = await axiosInstance.delete(`/meetingroom/booked/${meetingId}/`);
    return response?.data?.message || "예약이 취소되었습니다."; 
  } catch (error) {
    throw new Error(error.response?.data?.message || "예약 취소에 실패했습니다.");
  }
};

// 예약 수정 함수
export const updateMeetingRoomBooking = async (meetingId, formData) => {
  try {
    const response = await axiosInstance.patch(`/meetingroom/booked/${meetingId}/`, formData);
    dispatch(setMeetings(response.data));
    return response?.data?.message || "예약이 수정되었습니다.";
  } catch (error) {
    throw new Error(error.response?.data?.message || "예약 수정에 실패했습니다.");
  }
};

// 프로젝트 참여자 목록 조회 함수 
export const fetchParticipants = async (projectId) => {
  try {
    const response = await axiosInstance.get(
      `/meetingroom/project_participation/${projectId}/`,
    );
    return response.data["project_participation"];
  } catch (error) {
    console.error("프로젝트 참여자 목록 불러오기 오류:", error);
  }
};

// 회의별 회의록 mom 조회
export const fetchMomsByMeetings = async (meetingId) => {
  try {
    const response = await axiosInstance.get(
      `/meetingroom/moms_by_meeting/${meetingId}/`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "회의록을 불러오는 데에 실패했습니다.");
  }
};

// 프로젝트별 회의록 mom 조회
export const fetchMomsByProject = async (projectId) => {
  try {
    const response = await axiosInstance.get(
      `/meetingroom/moms_by_project/${projectId}/`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "회의록을 불러오는 데에 실패했습니다.");
  }
};



export const fetchMeetingDetails = async (meetingId) => {
  try {
    const response = await axiosInstance.get(`/meetingroom/booked/${meetingId}/`,
    );
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "회의상세 정보를 불러오는 데에 실패했습니다.");
  }
};


export const patchMom = async (meetingId, formData) => {
  try{
    const response = await axiosInstance.patch(`/meetingroom/moms_by_meeting/${meetingId}/`,
      formData
    )
    console.log(formData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "회의상세 정보를 불러오는 데에 실패했습니다.");
  }
}

export const fetchSummaryMomsByMeetings = async (meetingId) => {
  try {
    const response = await axiosInstance.get(
      `/meetingroom/summarymoms_by_meeting/${meetingId}/`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "요약된 회의록을 불러오는 데에 실패했습니다.");
  }
};