// 공지사항 리스트
import NoticeDetail from "./NoticeDetail";
import { useState, useEffect } from "react";
import { rtdb, auth } from "../../firebase/config";
import { ref, onValue, push, set, update } from "firebase/database";
import CloseButton from "../../assets/CloseButton";

export default function NoticeList(){
const [notices, setNotices] = useState([]);
 return(
    <>
    <h1>공지사항</h1>
    <NoticeDetail/>
    </>
 )
 }