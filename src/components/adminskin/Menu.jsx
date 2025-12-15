import logoW from '../../assets/logos/logoW.png';
import logo from '../../assets/logos/mainlogo.png';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb } from "../../firebase/config";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

export default function Menu(logoSize){
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const [floorGroups, setFloorGroups] = useState([]);


    // 메뉴 드롭다운
    const [openMenu, setOpenMenu] = useState({
    floor: false,
    data: false,
    issue: false,
    });

    useEffect(() => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    // users/{uid} 경로에서 사용자 정보 가져오기
    const userRef = ref(rtdb, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      setUserId(data.userId);
      setRole(data.role);  
    }
  });

  return () => unsubscribe();
}, []);

    //마이페이지 이동
    const goMyPage = () => {
    if (role === "master") {
        navigate("/master");
    } else if (role === "admin") {
        navigate("/adminpage");
    }
    };

    //토글메뉴
    const toggleMenu = (key) => {
    setOpenMenu((prev) => ({
        ...prev,
        [key]: !prev[key],
    }));
    };

    const show = () => {
        setOpen(!open);
    };

// 층수 메뉴 표시
    useEffect(() => {
  const fetchBuilding = async () => {
    const snapshot = await get(
      ref(rtdb, "buildings/43c82c19-bf2a-4068-9776-dbb0edaa9cc0")
    );
    if (!snapshot.exists()) return;

    const data = snapshot.val();

    const totalFloors = Number(data.floors);
    const basement = Number(data.down);
    const groundFloors = totalFloors - basement;

    const basementGroup =
      basement > 0
        ? [{ type: "basement", start: 1, end: basement }]
        : [];

    const groundGroupCount = Math.ceil(groundFloors / 10);
    const groundGroups = Array.from(
      { length: groundGroupCount },
      (_, i) => ({
        type: "ground",
        start: i * 10 + 1,
        end: Math.min((i + 1) * 10, groundFloors),
      })
    );

    setFloorGroups([...groundGroups.reverse(), ...basementGroup]);
  };

  fetchBuilding();
}, []);

    return(
        <div>
            <div className='pt-[13px]'>
                <Link to="/" className="inline-flex w-fit shrink-0">
                <img src={logo} alt="홈" className={logoSize || 'w-[216px] h-[84px] ml-[38px] cursor-pointer'}/>
                </Link>
            </div>
            
            <div className='wrap flex w-[450px]'>
                {/* 메뉴박스 */}
                <div className={`whiteBox w-[372px] h-full bg-white border-[#0888D4] border-2
                transition-transform duration-500 fixed top-0 left-0
                    ${open ? "translate-x-0" : "-translate-x-[372px]"} `}>
                    <img src={logo} alt="메뉴안로고" 
                        className='w-[216px] h-[84px] m-auto my-[20px]'/>
                    <div className='blueBox w-[318px] h-[600px] bg-[#E7F3F8] m-auto p-[15px]
                        border-[#0888D4] border-2'>
                        {/* 콘텐츠 */}
                        <div className='content'>
                            <span className='text-[20px] ml-[5px]'>안녕하세요! "{userId}"님</span>
                            <br></br>
                            <span className='ml-[210px] text-[#054E76] cursor-pointer' onClick={goMyPage}>마이페이지</span>
                            {/* 페이지 */}
                            <ul className='px-[20px] mt-[30px]'>
                                <li className='mt-[20px] cursor-pointer'>
                                    <div className='border-b-[1px] border-[#054E76]'>
                                        <Link to="/" className="inline-flex w-fit shrink-0">
                                            <span className='text-[20px] font-pyeojin'>홈</span>
                                        </Link>
                                    </div>
                                </li>
                                <li className="mt-[20px] cursor-pointer">
                                    <button
                                    type="button"
                                    onClick={() => toggleMenu("floor")}
                                    className="w-full flex justify-between items-center border-b border-[#054E76]"
                                    >
                                    <span className="text-[20px] font-pyeojin">층별 페이지</span>

                                    {/* 화살표 */}
                                    <div
                                    className={`arrow w-3 h-3 border-l-2 border-b-2 border-[#054E76] mt-[5px]
                                        transition-transform duration-300
                                        ${openMenu.floor ? "rotate-[135deg]" : "rotate-[-45deg]"}`}
                                    ></div>
                                    </button>

                                    {openMenu.floor && (
                                    <ul className="ml-[40px] mt-[8px] list-disc">
                                        {floorGroups.map((group) => (
                                        <li
                                            key={`${group.type}-${group.start}-${group.end}`}
                                            className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                                        >
                                            {group.type === "basement"
                                            ? `B${group.end}층 ~ B${group.start}층`
                                            : `${group.start}층 ~ ${group.end}층`}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </li>

                                {/* 데이터 현황 */}
                                <li className="mt-[20px] cursor-pointer">
                                    <button
                                    type="button"
                                    onClick={() => toggleMenu("data")}
                                    className="w-full flex justify-between items-center border-b border-[#054E76]"
                                    >
                                    <span className="text-[20px] font-pyeojin">데이터 현황</span>
                                    <div
                                    className={`arrow w-3 h-3 border-l-2 border-b-2 border-[#054E76] mt-[5px]
                                        transition-transform duration-300
                                        ${openMenu.data ? "rotate-[135deg]" : "rotate-[-45deg]"}`}
                                    ></div>
                                    </button>

                                    {openMenu.data && (
                                    <ul className="ml-[40px] mt-[8px] list-disc">
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>전기</li>
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>온도</li>
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>수도</li>
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>가스</li>
                                    </ul>
                                    )}
                                </li>

                                {/* 문제 현황 */}
                                <li className="mt-[20px] cursor-pointer">
                                    <button
                                    type="button"
                                    onClick={() => toggleMenu("issue")}
                                    className="w-full flex justify-between items-center border-b border-[#054E76]"
                                    >
                                    <span className="text-[20px] font-pyeojin">문제 현황</span>
                                    <div
                                    className={`arrow w-3 h-3 border-l-2 border-b-2 border-[#054E76] mt-[5px]
                                        transition-transform duration-300
                                        ${openMenu.issue ? "rotate-[135deg]" : "rotate-[-45deg]"}`}
                                    ></div>
                                    </button>

                                    {openMenu.issue && (
                                    <ul className="ml-[40px] mt-[8px] list-disc">
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>전기</li>
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>온도</li>
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>수도</li>
                                        <li className='cursor-pointer hover:text-[#054E76] hover:font-pyeojin'>가스</li>
                                    </ul>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* 메뉴태그 */}
                <div className={`tag w-[78px] h-[51px] bg-[#0888D4] flex justify-end items-center mt-[60px]
                    transition-transform duration-500 fixed top-[100px] left-[372px] cursor-pointer
                    ${open ? "translate-x-0" : "-translate-x-[372px]"}`}
                    onClick={show}>
                    <img src={logoW} alt="메뉴태그로고" 
                    className="w-[39px] h-[42px] block translate-x-[-10px]"/>
                </div>
            </div>
        </div>
    );
}