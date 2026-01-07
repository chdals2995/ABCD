// src/layout/AdminLayout.jsx
import { useState } from "react";
import Menu from "../components/adminskin/Menu";
import TopMenu from "../components/adminskin/TopMenu";
import AlarmDrawer from "../alarm/AlarmDrawer";


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
