import { useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, set } from "firebase/database";
import Button from '../../../assets/Button';

export default function Elevator(){
    const [form, setForm] = useState({
        name: "",
        num: "",
        all: "",
        down: "",
        belongTo: "",       
    });

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === "num") {
    setForm((prev) => ({ ...prev, num: value }));
  } else {
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  }
};

  // 저장 버튼 클릭
  const Save = async () => {
    if (!form.num || !String(form.belongTo).trim()) {
      alert("고유 번호와 소속 건물명은 필수입니다.");
      return;
    }

    try {
      const id = crypto.randomUUID(); // 랜덤 ID
      await set(ref(rtdb, `elevators/${id}`), {
        ...form,
        createdAt: Date.now(),
      });

      alert("등록되었습니다.");

      setForm({
        name: "",
        num: "",
        all: "",
        down: "",
        belongTo: "",
      });
    } catch (error) {
      console.error("승강기 등록 실패:", error);
      alert("등록에 실패하였습니다.");
    }
  };

    return(
        <div>
            <div className="w-[649px] h-[308px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] mx-auto">
                <div className='flex flex-col w-86 mx-auto translate-y-10'>
                    <div className="flex justify-between w-[342px]">
                        <label htmlFor="name" className='text-[20px] mb-[10px]'>승강기 명</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} 
                        className="h-[30px]"/>
                    </div>
                    <div className="flex justify-between w-[342px]">
                        <label htmlFor="num" className='text-[20px] mb-[10px]'>고유 번호</label>
                        <input type="text" name="num" value={form.num} onChange={handleChange} 
                        pattern="\d{4}-\d{3}" placeholder="  '-'를 포함해서 입력해주세요" className=" h-[30px]"/>
                    </div>
                    <div className="flex justify-between w-[342px]">
                        <label htmlFor="all" className='text-[20px] mb-[10px]'>총 운행 층수</label>
                        <input type="number" name="all" value={form.all} onChange={handleChange} className="h-[30px]"/>
                    </div>
                    <div className="flex justify-between w-[342px]">
                        <label htmlFor="down" className='text-[20px] mb-[10px]'>지하 층수</label>
                        <input type="number" name="down" value={form.down} onChange={handleChange} className="h-[30px]"/>
                    </div>
                    <div className="flex justify-between w-[342px]">
                        <label htmlFor="belongTo" className='text-[20px] mb-[10px]'>소속 건물명</label>
                        <input type="text" name="belongTo" value={form.belongTo} onChange={handleChange} className="h-[30px]"/>
                    </div>
                </div>
            </div>
            <div className='w-[79px] mx-auto mt-[29px]'>
                <Button onClick={Save}>등록</Button>
            </div>
        </div>
    );
}