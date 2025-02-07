import { createSlice } from "@reduxjs/toolkit";

export const projectSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
  },
  reducers: {
    setProjects: (state, action) => {
      state.list = action.payload; // 프로젝트 목록을 설정
    },
    addProject: (state, action) => {
      state.list.push(action.payload); // 새 프로젝트를 목록에 추가
    },
  },
});

export const { setProjects, addProject } = projectSlice.actions;

export default projectSlice.reducer;
