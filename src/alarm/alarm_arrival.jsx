import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

export default function AlarmArrival() {
    const [requestData, setRequestData] = useState(null);

    useEffect(() => {
        const requestsRef = ref(rtdb, "requests"); //'requests' 경로에서 데이터 읽기

        return onValue(requestsRef, (snapshot) => {
            const data = snapshot.val(); //데이터 가져오기
            if (data) {
                //파이어베이스에서 받아온 데이터를 최선 요청으로 설정
                const latestRequest = Object.entries(data).map(([id, v]) => ({
                    id,
                    title: v.title,
                    content: v.content,
                    status: v.status,
                    floor: v.floor,
                    room: v.room,
                    createdAt: new Date(v.createdAt), //createdAt을 Date로 변환
                    userEmail: v.userEmail,
                    type: v.type,
                }))[0]; //최신 요청 하나만 추출
                setRequestData(latestRequest); //데이터 상태로 저장
            }
        });
    }, []);

    return (
        <div className="request-arrival-modal">
            {requestData ? (
                <div>
                    <h2>{requestData.tltle}</h2>
                    <p>{requestData.content}</p>
                    <p>Status: {requestData.status}</p>
                    <p>Tyoe: {requestData.type}</p>
                    <p>Floor: {requestData.floor} - Room: {requestData.room}</p>
                    <p>Email: {requestData.userEmail}</p>
                    <p>Created At: {requestData.createdAt.toLocaleString()}</p>
                </div>
            ) : (
                <p>불러오는 중입니다...</p> //데이터가 로딩 중일때 
            )}
        </div>
    );
}