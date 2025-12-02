import { useState } from "react"

export default function Alarm(){
    const [tab, setTab] = useState("request"); //어떤 탭을 보고 있는지 상태
    // "request" -> 요청 알립 탭 ｜ "problem" -> 문제 알림 탭 
    const [popup, setPopup] = useState(null); //어떤 팝업(드롭다운)을 열었는지 관리
    // "null" -> 팝업 없음 
    // "urgent" -> 긴급 알림 ｜ "caution" -> 주의 알림
    // "requestDrop" -> 요청 알림 드롭다운  
    const [selected, setSelected] = useState(null);// 리스트에서 클릭한 특정 알림 데이터 
    // 선택 시 RequestArrival 창이 열림
    // null이면 닫힘


    
            {/* 상단 아이콘 영역 -> 팝업 열기 */}
            <TopIcons 
                onUrgent={() => setPopup ("urgent")} // 긴급 팝업 열기
                onCaution = { () => setPopup ("caution")} //주의 팝업 열기 
                onRequestDrop = { () => setPopup("requestDrop")} //요청 팝업 열기 
            />

            {/* 요청 ｜ 문제 탭 전환 */}
            <AlarmTabs value={tab} onChange={setTab} />

            {/* 요청 알림 리스트 */}
            {tab === "request" && (
                <AlarmRequest
                  onSelect = {setSelected} //선택된 알림 전달 
                  />
            )}

            {/* 문제 알림 리스트 */}
            {tab === "problem" && (
                <AlarmProblems
                  onSelect = {setSelected}  //선택된 알림 전달2222
                />
            )}

            {/* 요청 팝업 */}
            {popup === "requestDrop" && (
                <AlarmDropDownRequest
                  onClose={() => setPopup(null)} //팝업 닫기 
                />
            )}


            {/* 주의 팝업 */}
            {popup === "caution" &&(
                <AlarmDropDownCaution
                  onClose={() => setPopup(null)} //팝업 닫기 2222
                />
            )}


            {/* 긴급 팝업 */}  
            {popup === "urgent" && (
                <AlarmDropDownUrgent
                onClose = {() => setPopup(null)} //팝업 닫기 33333
                />
            )}
            
            {/* 선택한 알림 상세창 */}
            {selected && (
                <RequestArrival
                 data = {selected}
                 onClose= { () => setSelected(null)} //창 닫기 
                />
             )}

        </div>
    );
}

