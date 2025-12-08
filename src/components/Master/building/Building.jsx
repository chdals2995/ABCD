import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue } from "firebase/database";
import Button from '../../../assets/Button';



export default function Building(){
    const [form, setForm] = useState({
        name: "",
        up: "",
        down: "",
        floors: "",
        park: "no",       // 주차타워: yes / no
        parkf: "",
    });
    
  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 저장 버튼 클릭
  const Save = async () => {
    if (!form.name || !form.floors) {
      alert("건물명과 전체 층수는 필수입니다.");
      return;
    }

    try {
      const id = crypto.randomUUID(); // 랜덤 ID
      await set(ref(rtdb, `buildings/${id}`), {
        ...form,
        createdAt: Date.now(),
      });

      setForm({
        name: "",
        up: "",
        down: "",
        floors: "",
        park: "no",
        parkf: "",
      });
    } catch (error) {
      console.error("건물 저장 실패:", error);
      alert("저장 실패");
    }
  };

    return(
        <div>
            <div className="w-[649px] h-[308px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px]">
                <div className='flex flex-col items-end w-[75px]'>
                    <div>
                        <label htmlFor="name" className='text-[20px] mb-[10px]'>건물명</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="floors" className='text-[20px] mb-[10px]'>전체 층수</label>
                        <input type="number" name="floors" value={form.floors} onChange={handleChange}/>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-[100px]">
                            <label htmlFor="up" className='text-[20px] mb-[10px]'>지상</label>
                            <input type="number" name="up" value={form.up} onChange={handleChange} className="w-[60px]"/>
                        </div>
                        <div className="w-[100px]">
                            <label htmlFor="down" className='text-[20px] mb-[10px]'>지하</label>
                            <input type="number" name="down" value={form.down} onChange={handleChange} className="w-[60px]"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="park" className='text-[20px] mb-[10px]'>주차타워</label>
                        <input type="radio" name="park"
                  value="yes"
                  checked={form.park === "yes"}
                  onChange={handleChange}/>유
                        <input type="radio" name="park"
                  value="no"
                  checked={form.park === "no"}
                  onChange={handleChange}/>무
                    </div>
                    {form.park === "yes" && (
                    <div>
                        <label htmlFor="parkf" className='text-[20px] mb-[10px]'>층수</label>
                        <input type="number" name="parkf"
                value={form.parkf}
                onChange={handleChange}/>
                    </div>
                    )}
                </div>
            </div>
            <div className='w-[79px] mx-auto mt-[29px]'>
                <Button onClick={Save} >저장</Button>
            </div>
        </div>
    );
}