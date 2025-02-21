import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaBell, FaTimes } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux"; // useDispatch, useSelector 추가
import { getNotifications, markAsRead } from "../api/notification"; // named import로 가져오기
import { setNotifications, markAsReadInStore } from "../redux/notificationSlice"; // 리덕스 액션 가져오기


// 알림창 스타일
const NotificationWidgetContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: absolute;
  top: 70px; /* Navbar 아래 위치 */
  right: 20px;
  z-index: 999;
  max-height: 400px;
  transition: all 0.3s ease-in-out;
`;

const NotificationHeader = styled.div`
  padding: 10px;
  background-color: #f5f5f5;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 20px;
  &:hover {
    color: #333;
  }
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  background-color: ${(props) => (props.unread ? "#f9f9f9" : "white")};
  font-size: 14px;
  color: ${(props) => (props.unread ? "#333" : "#666")};
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MarkAsReadButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: #45a049;
  }
`;

const NotificationWidget = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications); // 리덕스에서 알림 가져오기
  const unreadCount = useSelector((state) => state.notifications.unreadCount); // 리덕스에서 읽지 않은 알림 개수 가져오기
  const [isOpen, setIsOpen] = useState(false);
  // 이전 알림 상태 추적용 ref
  const prevNotificationsRef = useRef();


    // 알림 목록 가져오기
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          await getNotifications(dispatch); // 리덕스에 알림 데이터 설정
        } catch (error) {
          console.error("알림 가져오기 실패:", error);
        }
      };
  
      fetchNotifications();
    }, [dispatch]);
  
    // 알림 아이콘 클릭 시 열기/닫기
    const toggleNotificationWidget = () => {
      setIsOpen((prev) => !prev);
    };
    // 알림 읽음 처리
    const handleMarkAsReadClick = async (notifId, event) => {
      event.preventDefault(); // 클릭 시 페이지 이동을 막기 위해 추가
    
      try {
        await markAsRead(notifId, dispatch); // 리덕스에서 읽음 처리
        // 상태 업데이트: 해당 알림을 읽음 처리
      } catch (error) {
        console.error("알림 읽음 처리 실패:", error);
      }
    };
    
    return (
      <div>
        {/* 알림 아이콘 */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={toggleNotificationWidget}>
          <FaBell size={24} />
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </div>
  
        {/* 알림 창 */}
        {isOpen && (
          <NotificationWidgetContainer>
            <NotificationHeader>
              알림
              <CloseButton onClick={toggleNotificationWidget}>
                <FaTimes />
              </CloseButton>
            </NotificationHeader>
            <NotificationList>
              {notifications.length === 0 ? (
                <p style={{ padding: "10px", textAlign: "center" }}>
                  새로운 알림이 없습니다.
                </p>
              )  : (
                notifications.map((notif) => (
                  <NotificationItem key={notif.id} unread={!notif.read}>
                  <div>
                    <p>{notif.message}</p>
                  </div>
                  {/* 읽음 처리 버튼 */}
                  {!notif.read && (
                    <MarkAsReadButton onClick={(e) => handleMarkAsReadClick(notif.id, e)}>
                      읽음 처리
                    </MarkAsReadButton>
                  )}
                </NotificationItem>                
                ))
              )}
            </NotificationList>
          </NotificationWidgetContainer>
        )}
      </div>
    );
  };
  
  export default NotificationWidget;