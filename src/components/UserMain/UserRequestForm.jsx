// src/components/userMain/UserRequestForm.jsx
import { useEffect, useMemo, useState } from "react";
import { ref, push, set, get } from "firebase/database";
import { rtdb } from "../../firebase/config";
import { useAuth } from "../Login/contexts/AuthContext";
import Button from "../../assets/Button";

const INITIAL_FORM = {
  title: "",
  date: "",
  floor: "",
  type: "전기",
  content: "",
};

// ✅ 스샷에 보이는 빌딩 키(= floors가 들어있는 노드 키)
// 필요하면 여기만 너 DB 구조에 맞게 바꿔줘.
const BUILDING_ID = "43c82c19-bf2a-4068-9776-dbb0edaa9cc0";
// 예) buildings 폴더 아래면: const BUILDING_KEY = "buildings/43c82c19-...";

export default function UserRequestForm() {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  // ✅ RTDB에서 최대 층수 가져오기
  const [maxFloors, setMaxFloors] = useState(0);

  useEffect(() => {
  (async () => {
    try {
      const snap = await get(ref(rtdb, `buildings/${BUILDING_ID}/floors`));
      const v = snap.val();
      const n = parseInt(v, 10);
      setMaxFloors(Number.isFinite(n) ? n : 0);
    } catch (e) {
      console.error("[UserRequestForm] floors 불러오기 실패:", e);
      setMaxFloors(0);
    }
  })();
}, []);

  const floorOptions = useMemo(() => {
    if (!maxFloors || maxFloors < 1) return [];
    return Array.from({ length: maxFloors }, (_, i) => String(i + 1));
  }, [maxFloors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("로그인 후 이용 가능합니다.");

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content || !form.date || !form.floor || !form.type) {
      return alert("모든 항목을 입력해주세요.");
    }

    try {
      setLoading(true);
      const newRef = push(ref(rtdb, "requests"));

      await set(newRef, {
        title,
        date: form.date,
        floor: form.floor, // ✅ select 값(문자열)
        type: form.type,
        content,
        status: "접수",
        userUid: user.uid,
        userEmail: user.email || null,
        createdAt: Date.now(),

        // ❌ user_id: 저장 안 함
      });

      setForm(INITIAL_FORM);
      alert("접수되었습니다.");
    } catch (err) {
      console.error(err);
      alert("민원 등록 중 오류\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[520px] bg-white rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] px-10 py-8 "
    >
        <h1 className="font-pyeojin font-bold text-[24px] mb-5 mt-[-10px] ml-[60%] translate-x-[-50%]">불편 사항</h1>
      {/* 제목 */}
      <div className="flex items-center gap-3 mb-3">
        <label className="w-[70px] text-[14px]">제목 :</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="flex-1 h-[28px] border border-[#B8D0DB] px-2 outline-none"
        />
      </div>

      {/* 일시 */}
      <div className="flex items-center gap-3 mb-3">
        <label className="w-[70px] text-[14px]">일시 :</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="flex-1 h-[28px] border border-[#B8D0DB] px-2 outline-none"
        />
      </div>

      {/* ✅ 장소 제거 → 층(select) */}
      <div className="flex items-center gap-3 mb-3">
        <label className="w-[70px] text-[14px]">층 :</label>
        <select
  name="floor"
  value={form.floor}
  onChange={handleChange}
  className="flex-1 h-[28px] border border-[#B8D0DB] px-2 outline-none bg-white"
  // disabled={floorOptions.length === 0}  // ❌ 제거
>
  <option value="">
    {floorOptions.length === 0 ? "층 정보 로딩/없음" : "층 선택"}
  </option>

  {floorOptions.map((f) => (
    <option key={f} value={f}>
      {f}층
    </option>
  ))}

  <option value="기타">기타</option>
</select>

</div>
      {/* ✅ 유형(라디오) + 기타 추가 */}
      <div className="flex items-center gap-3 mb-4">
        <label className="w-[70px] text-[14px]">유형 :</label>
        <div className="flex gap-4 text-[14px]">
          {["전기", "온도", "수도", "가스", "기타"].map((t) => (
            <label key={t} className="flex items-center gap-1">
              <input
                type="radio"
                name="type"
                value={t}
                checked={form.type === t}
                onChange={handleChange}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* 내용 */}
      <div className="mb-6">
        <div className="text-[14px] mb-1">내용</div>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="w-full h-[250px] border border-[#B8D0DB] px-2 py-2 outline-none resize-none"
        />
      </div>

      <div className="flex justify-center">
        <Button disabled={loading}>{loading ? "등록중..." : "확인"}</Button>
      </div>
    </form>
  );
}
