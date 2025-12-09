// 유저 메인 페이지
import NoticeList from "../components/UserMain/NoticeList";
import UserRequests from "../components/UserMain/UserRequests";
import RequestArrival from "../components/UserMain/RequestArrival";
export default function UserMain(){
return(
<>
 <NoticeList/>
 <UserRequests/>
 <RequestArrival/>
</>
);
}