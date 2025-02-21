import React, { useState } from "react"; // React 및 상태 관리를 위한 useState 가져오기
import styled from "styled-components"; // CSS-in-JS 스타일링을 위한 styled-components 가져오기
import logo from "/203ai_logo.png"; // 로고 이미지 가져오기
import robot from "/robot.png"; // 로봇 이미지 가져오기

// ✅ 전체 페이지 스타일 (좌우 여백 조정)
const LoginContainer = styled.div`
  width: 100vw; /* 뷰포트 전체 너비 사용 */
  height: 100vh; /* 뷰포트 전체 높이 사용 */
  display: flex;
  justify-content: flex-start; /* 로그인 박스를 왼쪽 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  padding: 0 10%; /* 좌우 여백 추가 */
  background: rgb(255, 255, 255); /* 배경색 설정 */
  position: relative;
  overflow: hidden; /* 넘치는 요소 숨기기 */
  box-sizing: border-box; /* padding 포함한 크기 계산 */

  /* 모바일 화면에서는 로그인 박스를 중앙 정렬 */
  @media (max-width: 768px) {
    justify-content: center;
    padding: 0 5%;
  }
`;

// ✅ 네비게이션 바 스타일 (우측 상단)
const NavBar = styled.div`
  position: absolute;
  top: 20px;
  right: 50px; /* 기존 100px → 50px으로 조정 */
  display: flex;
  gap: 30px; /* 메뉴 간격 */
  font-size: 14px;
  color: #333;
  cursor: pointer;

  /* 모바일 화면에서는 크기 조정 */
  @media (max-width: 768px) {
    top: 10px;
    right: 30px;
    font-size: 12px;
  }
`;

// ✅ 로그인 박스 (크기 조정)
const LoginBox = styled.div`
  width: 100%;
  max-width: 350px; /* 최대 너비 설정 */
  padding: 80px; /* 내부 여백 조정 */
  background: white;
  border-radius: 12px; /* 모서리 둥글게 */
  text-align: center; /* 내부 텍스트 가운데 정렬 */
  position: relative;
  z-index: 2;
  bottom: 3%;

  /* 모바일 화면에서는 너비 조정 */
  @media (max-width: 768px) {
    width: 90%;
  }
`;

// ✅ 로고 스타일 (로그인 폼 상단)
const Logo = styled.img`
  width: 400px;
  margin-bottom: 20px;

  /* 모바일 화면에서는 로고 크기 조정 */
  @media (max-width: 768px) {
    width: 80%;
  }
`;

// ✅ 입력 필드 전체 Wrapper (정렬을 위해 추가)
const InputContainer = styled.div`
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: flex-start; /* 왼쪽 정렬 */
  width: 100%;
  margin-bottom: 15px;
`;

// ✅ 입력 필드 라벨 스타일
const InputLabel = styled.label`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: left; /* 왼쪽 정렬 */
  width: 100%;
  color: #274C77; /* 라벨 색상 */
`;

// ✅ 입력 필드 스타일
const Input = styled.input`
  width: 100%; /* 너비 맞추기 */
  padding: 12px;
  border: 2px solid #274C77; /* 테두리 색상 */
  border-radius: 25px;
  font-size: 16px;
  outline: none;

  /* 포커스 시 테두리 색상 변경 */
  &:focus {
    border-color: #0056b3;
  }
`;

// ✅ 옵션 스타일 (Remember Me, Forget Password)
const Options = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #003366;
  margin-top: 10px;
  width: 100%;
`;

// ✅ 로그인 버튼 스타일
const Button = styled.button`
  width: 378px; /* 너비 맞추기 */
  padding: 12px;
  margin-top: 20px;
  background: #274C77; /* 버튼 배경색 */
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: 0.3s;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);

  /* 마우스 오버 시 색상 변경 */
  &:hover {
    background: #0056b3;
  }
`;

// ✅ 로봇 이미지 스타일
const RobotImage = styled.img`
  width: 350px; /* 크기 조정 */
  max-width: 30vw; /* 최대 너비 제한 */
  position: absolute;
  bottom: 20%;
  right: 18%; /* 기존 30% → 18%로 조정 */
  z-index: 1;

  /* 1024px 이하에서 로봇 이미지 숨김 */
  @media (max-width: 1024px) {
    display: none;
  }
`;

// ✅ 로그인 컴포넌트
const Login = ({ onLogin }) => {
  // 입력값을 저장하는 상태 변수 (useState 사용)
  const [employee_number, setEmployeeNumber] = useState(""); // 사원 번호 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태

  // 폼 제출 시 실행되는 함수
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    onLogin(employee_number, password); // 부모 컴포넌트(LoginPage)에서 전달받은 onLogin 함수 실행
  };

  return (
    <LoginContainer>
      {/* 네비게이션 바 */}
      <NavBar>
        <span>Help</span>
        <span>Contact us</span>
        <span>English ▼</span>
      </NavBar>

      {/* 로그인 폼 */}
      <LoginBox>
        <Logo src={logo} alt="203ai 로고" />

        <form onSubmit={handleSubmit}>
          {/* 아이디 입력 필드 */}
          <InputContainer>
            <InputLabel>Employee Number</InputLabel>
            <Input
              type="text"
              placeholder="1231234"
              value={employee_number}
              onChange={(e) => setEmployeeNumber(e.target.value)}
            />
          </InputContainer>

          {/* 비밀번호 입력 필드 */}
          <InputContainer>
            <InputLabel>Password</InputLabel>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputContainer>

          {/* 옵션 (Remember me / Forget password) */}
          <Options>
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <span style={{ cursor: "pointer" }}>Forget password?</span>
          </Options>

          {/* 로그인 버튼 */}
          <Button type="submit">Login</Button>
        </form>
      </LoginBox>

      {/* 로봇 이미지 */}
      <RobotImage src={robot} alt="로봇 이미지" />
    </LoginContainer>
  );
};

export default Login;
