// src/pages/userMain/UserMain.jsx
import NoticeList from "../components/userMain/NoticeList";
import RequestArrival from "../components/userMain/RequestArrival"
import UserRequestForm from "../components/userMain/UserRequestForm";
import UserLayout from "../layout/UserLayout"

export default function UserMain() {
  return (
    <div className="min-h-screen bg-[#E4EDF0]">
      {/* 상단(로고/타이틀 자리) */}
      <UserLayout/>  
         
      {/* 본문 3단 */}
      <main className="mx-auto w-full pt-6 absolute top-[80px]">
        <div className="grid grid-cols-[320px_1fr_320px] gap-8">
          {/* 좌: 공지 */}
          <aside className="h-[760px] bg-[#DCEAF0] border border-[#B8D0DB] p-4">
            <NoticeList />
          </aside>

          {/* 가운데: 불편사항 작성 */}
          <section className="h-[760px] flex items-center justify-center">
            <div className="w-full max-w-[720px] h-[700px] bg-[#E4EDF0] border-[6px] border-[#054E76] rounded-[8px] flex flex-col items-center justify-start py-6">
              <UserRequestForm />
            </div>
          </section>

          {/* 우: 민원 목록/검색/탭 */}
          <aside className="h-[760px] bg-white border border-[#B8D0DB] p-4">
            <RequestArrival />
          </aside>
        </div>
      </main>
    </div>
  );
}
