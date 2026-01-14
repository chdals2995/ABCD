import Close from '../../../assets/icons/close.png';
import Modal from '../../../assets/Modal'
import Button from '../../../assets/Button';
import { useState, useEffect } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, update } from "firebase/database";

export default function ElevatorManagement({elevator, open, close}){
    const [form, setForm] = useState({
        name: "",
        num: "",
        all: "",
        down: "",
        belongTo: "",       
    });

    const [error, setError] = useState("");

    useEffect(() => {
    if (elevator) {
      setForm({
        name: elevator.name,
        num: elevator.num,
        all: elevator.all,
        down: elevator.down,
        belongTo: elevator.belongTo,
      });
      setError("");
    }
  }, [elevator]);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

    const SaveEdit = async () => {
    if (!form.num || !form.belongTo) {
        setError("고유 번호와 소속 건물명은 필수입니다.");
        return;
    }

    try {
        await update(ref(rtdb, `elevators/${form.id}`), {
        name: form.name,
        num: form.num,
        all: form.all,
        down: form.down,
        belongTo: form.belongTo,
        updatedAt: Date.now(),
        });

        alert("수정되었습니다.");
        close(); // 모달 닫기
    } catch (error) {
        console.error("수정 실패:", error);
        setError("수정에 실패하였습니다.");
    }
    };

    if (!open || !elevator) return null;
  

    return(
        <>
            <Modal isOpen={open} onClose={close}>
                {/* 제목과 닫기 */}
                <div className='ml-[66px] relative'>
                    <p className='text-[26px] font-pyeojin mt-[71px]'>승강기 정보</p>
                    <img src={Close} alt="닫기" className='w-[41px] h-[41px] absolute top-3 right-3'
                        onClick={()=>close()}/>
                </div>
                {/* 승강기 정보 */}
                <div className="w-[422px] h-[224px] bg-white 
                  ml-[66px] mt-[19px] pt-4 rounded-[10px]
                  shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
                  flex justify-between">
                    <div className='flex flex-col mx-auto'>
                        <div className="flex justify-between w-[342px]">
                            <label htmlFor="name" className='text-[20px] mb-[10px]'>승강기 명</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} 
                            className="h-[30px]"/>
                        </div>
                        <div className="flex justify-between w-[342px]">
                            <label htmlFor="num" className='text-[20px] mb-[10px]'>고유 번호</label>
                            <input type="text" id="num" value={form.num} onChange={handleChange} 
                            pattern="\d{4}-\d{3}" placeholder="  '-'를 포함해서 입력해주세요" className="h-[30px]"/>
                        </div>
                        <div className="flex justify-between w-[342px]">
                            <label htmlFor="all" className='text-[20px] mb-[10px]'>총 운행 층수</label>
                            <input type="number" id="all" value={form.all} onChange={handleChange} className="h-[30px]"/>
                        </div>
                        <div className="flex justify-between w-[342px]">
                            <label htmlFor="down" className='text-[20px] mb-[10px]'>지하 층수</label>
                            <input type="number" name="down" value={form.down} onChange={handleChange} className="h-[30px]"/>
                        </div>
                        <div className="flex justify-between w-[342px]">
                            <label htmlFor="belongTo" className='text-[20px] mb-[10px]'>소속 건물명</label>
                            <input type="text" id="belongTo" value={form.belongTo} onChange={handleChange} className="h-[30px]"/>
                        </div>
                    </div>
                    {/* 에러 메시지 */}
                        {error && (
                            <p className="text-red-500 text-center mt-2">{error}</p>
                        )}
                    </div>
                {/* 승인버튼 */}
                    <div className='w-[79px] mx-auto mt-[29px]'>
                        <Button onClick={SaveEdit}>저장</Button>
                    </div>
            </Modal>
        </>
    );
}