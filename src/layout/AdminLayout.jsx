<<<<<<< HEAD
// src/layout/AdminLayout.jsx
import { useState } from "react";
import Menu from "../components/adminskin/Menu";
import TopMenu from "../components/adminskin/TopMenu";
import AlarmDrawer from "../alarm/AlarmDrawer";
=======
import Menu from '../components/admin/Menu';
import TopMenu from '../components/admin/TopMenu';
import Logo from '../assets/logos/logo.png';
>>>>>>> 4c0b943 (테이블 표 규격 및 사이즈 정리, 필터 (전체/달력) 추가, 상태 정렬순으로 볼 수 있는 접수/처리중/완료 추가, 달력 랑이브러리 DatePicker 설치 및 import 월화수목금 표시를 위한 locale(ko) 설치 및 적용)

export default function AdminLayout({ logoSize, floorGroups }) {
  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmTab, setAlarmTab] = useState("problem"); // "problem" | "request"

  // ✅ 같은 탭 아이콘을 다시 누르면 닫히게(토글)
  const openAlarm = (tab) => {
    setAlarmOpen((prevOpen) => {
      if (prevOpen && alarmTab === tab) {
        return false; // 같은 탭이면 닫기
      }
      return true; // 아니면 열기
    });

    // 열려있을 때 다른 탭 누르면 탭만 전환
    if (alarmTab !== tab) {
      setAlarmTab(tab);
    }
  };

  const closeAlarm = () => setAlarmOpen(false);

  return (
    <div>
      <Menu logoSize={logoSize} floorGroups={floorGroups} />

      {/* ✅ TopMenu 아이콘 누르면 Drawer 토글 */}
      <TopMenu onOpenAlarm={openAlarm} />

      <AlarmDrawer
        open={alarmOpen}
        tab={alarmTab}
        onClose={closeAlarm}
        onTabChange={setAlarmTab}
      />
    </div>
  );
}
