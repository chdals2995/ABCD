// src/layout/AdminLayout.jsx
import { useState } from "react";
import Menu from "../components/adminskin/Menu";
import TopMenu from "../components/adminskin/TopMenu";
import AlarmDrawer from "../alarm/AlarmDrawer";

export default function AdminLayout({ logoSize, floorGroups }) {
  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmTab, setAlarmTab] = useState("problem"); // "problem" | "request"

  const openAlarm = (tab) => {
    setAlarmTab(tab);
    setAlarmOpen(true);
  };

  const closeAlarm = () => setAlarmOpen(false);

  return (
    <div>
      <Menu logoSize={logoSize} floorGroups={floorGroups} />

      {/* ✅ TopMenu 아이콘 누르면 현재 화면 위에 Drawer만 추가로 표시 */}
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
