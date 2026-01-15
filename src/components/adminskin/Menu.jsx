// src/components/common/Menu.jsx
import logoW from "../../assets/logos/logoW.png";
import logo from "../../assets/logos/mainlogo.png";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb, auth } from "../../firebase/config";
import { Link, useNavigate } from "react-router-dom";

const BUILDING_ID = "43c82c19-bf2a-4068-9776-dbb0edaa9cc0";

// ✅ metric 매핑(문제현황 / data / requests type 등 혼용 대비)
function normalizeMetric(m) {
  const s = String(m || "")
    .trim()
    .toLowerCase();

  if (
    s === "전력" ||
    s === "전기" ||
    s === "elec" ||
    s === "electric" ||
    s === "electricity" ||
    s === "power"
  )
    return "전력";
  if (s === "온도" || s === "temp" || s === "temperature") return "온도";
  if (s === "수도" || s === "water") return "수도";
  if (s === "가스" || s === "gas") return "가스";

  return "all";
}

export default function Menu({ logoSize }) {
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // users/{uid} 경로에서 사용자 정보 가져오기
      const userRef = ref(rtdb, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserId(data.userId || "");
        setRole(data.role || "");
      }
    });

    return () => unsubscribe();
  }, []);

  // 마이페이지 이동
  const goMyPage = () => {
    if (role === "master") {
      navigate("/master");
    } else if (role === "admin") {
      navigate("/adminpage");
    }
  };

  // 토글메뉴
  const toggleMenu = (key) => {
    setOpenMenu((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const show = () => setOpen((v) => !v);

  // ✅ 층 구간 클릭 -> Floors로 이동 (state로 floorTarget 전달)
  const goFloorsByGroup = (group) => {
    navigate("/floors", {
      state: {
        floorTarget: {
          type: group.type, // "ground" | "basement"
          start: group.start,
          end: group.end,
        },
      },
    });

    // (선택) 메뉴 닫기
    setOpen(false);
    setOpenMenu((prev) => ({ ...prev, floor: false }));
  };

  // ✅ 데이터 현황 클릭 -> /data/XXX 로 이동
  const goData = (subPath) => {
    navigate(`/data/${subPath}`);
    setOpen(false);
    setOpenMenu((prev) => ({ ...prev, data: false }));
  };

  // ✅ 문제 현황 클릭 -> /problems 로 이동 + 탭(metric) 지정
  const goProblems = (metric) => {
    const mapped = normalizeMetric(metric);

    navigate("/problems", {
      state: { metric: mapped }, // ✅ Problems에서 selectedMetric으로 반영
    });

    setOpen(false);
    setOpenMenu((prev) => ({ ...prev, issue: false }));
  };

  // ✅ 층수 메뉴 표시 (항상 이 BUILDING_ID 기준)
  useEffect(() => {
    const fetchBuilding = async () => {
      const snapshot = await get(ref(rtdb, `buildings/${BUILDING_ID}`));
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const basement = Number(data.down) || 0;

      const up =
        data.up != null
          ? Number(data.up) || 0
          : Math.max(0, (Number(data.floors) || 0) - basement);

      const basementGroup =
        basement > 0 ? [{ type: "basement", start: 1, end: basement }] : [];

      const groundGroupCount = Math.ceil(up / 10);
      const groundGroups = Array.from({ length: groundGroupCount }, (_, i) => ({
        type: "ground",
        start: i * 10 + 1,
        end: Math.min((i + 1) * 10, up),
      }));

      // ✅ 위층부터 보이게 (지상: 높은층 -> 낮은층) + 지하
      setFloorGroups([...groundGroups.reverse(), ...basementGroup]);
    };

    fetchBuilding();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div>
      <div className="pt-[13px] relative">
        <Link to="/" className="inline-flex w-fit shrink-0">
          <img
            src={logo}
            alt="홈"
            className={
              logoSize || "w-[216px] h-[84px] ml-[38px] cursor-pointer"
            }
          />
        </Link>
      </div>

      <div className="wrap flex w-[450px]">
        {/* 메뉴박스 */}
        <div
          className={`whiteBox w-[372px] h-full bg-white border-[#0888D4] border-2
            transition-transform duration-500 fixed top-0 left-0 z-50
            ${open ? "translate-x-0" : "-translate-x-[372px]"} `}
        >
          <img
            src={logo}
            alt="메뉴안로고"
            className="w-[216px] h-[84px] m-auto my-[20px]"
          />

          <div
            className="blueBox w-[318px] min-h-[600px] bg-[#E7F3F8] m-auto p-[15px]
              border-[#0888D4] border-2"
          >
            {/* 콘텐츠 */}
            <div className="content">
              <span className="text-[20px] ml-[5px]">
                안녕하세요! "{userId}"님
              </span>
              <br />
              <span
                className="block mt-[10px] ml-[210px] text-[#054E76] cursor-pointer"
                onClick={goMyPage}
              >
                마이페이지
              </span>

              {/* 페이지 */}
              <ul className="px-[20px] mt-[30px]">
                <li className="mt-[20px] cursor-pointer">
                  <div className="border-b-[1px] border-[#054E76]">
                    <Link to="/" className="inline-flex w-fit shrink-0">
                      <span className="text-[20px] font-pyeojin">홈</span>
                    </Link>
                  </div>
                </li>

                {/* 층별 페이지 */}
                <li className="mt-[20px] cursor-pointer">
                  <button
                    type="button"
                    onClick={() => toggleMenu("floor")}
                    className="w-full flex justify-between items-center border-b border-[#054E76]"
                  >
                    <span className="text-[20px] font-pyeojin">
                      층별 페이지
                    </span>

                    <div
                      className={`arrow w-3 h-3 border-l-2 border-b-2 border-[#054E76] mt-[5px]
                        transition-transform duration-300
                        ${
                          openMenu.floor ? "rotate-[135deg]" : "rotate-[-45deg]"
                        }`}
                    />
                  </button>

                  {openMenu.floor && (
                    <ul className="ml-[40px] mt-[8px] list-disc">
                      {floorGroups.map((group) => (
                        <li
                          key={`${group.type}-${group.start}-${group.end}`}
                          className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                          onClick={() => goFloorsByGroup(group)}
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
                    <span className="text-[20px] font-pyeojin">
                      데이터 현황
                    </span>
                    <div
                      className={`arrow w-3 h-3 border-l-2 border-b-2 border-[#054E76] mt-[5px]
                        transition-transform duration-300
                        ${
                          openMenu.data ? "rotate-[135deg]" : "rotate-[-45deg]"
                        }`}
                    />
                  </button>

                  {openMenu.data && (
                    <ul className="ml-[40px] mt-[8px] list-disc">
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goData("ElecData")}
                      >
                        전기
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goData("TempData")}
                      >
                        온도
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goData("WaterData")}
                      >
                        수도
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goData("GasData")}
                      >
                        가스
                      </li>
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
                        ${
                          openMenu.issue ? "rotate-[135deg]" : "rotate-[-45deg]"
                        }`}
                    />
                  </button>

                  {openMenu.issue && (
                    <ul className="ml-[40px] mt-[8px] list-disc">
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goProblems("전력")}
                      >
                        전기
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goProblems("온도")}
                      >
                        온도
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goProblems("수도")}
                      >
                        수도
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#054E76] hover:font-pyeojin"
                        onClick={() => goProblems("가스")}
                      >
                        가스
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div
            className="text-[#0888D4] border-b hover:font-pyeojin hover:text-[#054E76]
              w-[60px] mt-[160px] ml-[280px] cursor-pointer"
            onClick={handleLogout}
          >
            로그아웃
          </div>
        </div>

        {/* 메뉴태그 */}
        <div
          className={`tag w-[78px] h-[51px] bg-[#0888D4] flex justify-end items-center mt-[60px]
            transition-transform duration-500 fixed top-[100px] left-[372px] z-50 cursor-pointer
            ${open ? "translate-x-0" : "-translate-x-[372px]"}`}
          onClick={show}
        >
          <img
            src={logoW}
            alt="메뉴태그로고"
            className="w-[39px] h-[42px] block translate-x-[-10px]"
          />
        </div>
      </div>
    </div>
  );
}
