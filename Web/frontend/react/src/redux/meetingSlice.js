// src/redux/meetingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  meetings: [], // 회의 목록 초기화
};

const meetingSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    setMeetings: (state, action) => {
      state.meetings = action.payload;
    },
    addMeeting: (state, action) => {
      state.meetings.push(action.payload); // 새 회의 추가
    },
  },
});

export const { setMeetings, addMeeting } = meetingSlice.actions;

export default meetingSlice.reducer;
