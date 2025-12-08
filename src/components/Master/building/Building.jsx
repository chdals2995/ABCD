import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue } from "firebase/database";



export default function Building(){
    

    return(
        <div className="w-[649px] h-[308px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px]">
            <div className='flex flex-col items-end w-[75px]'>
                <div>
                    <label htmlFor="name" className='text-[20px] mb-[10px]'>건물명</label>
                    <input type="text" name="name" />
                </div>
                <div>
                    <label htmlFor="floors" className='text-[20px] mb-[10px]'>전체 층수</label>
                    <input type="number" name="floors" />
                </div>
                <div>
                <div>
                    <label htmlFor="up" className='text-[20px] mb-[10px]'>지상</label>
                    <input type="number" name="up" />
                </div>
                <div>
                    <label htmlFor="down" className='text-[20px] mb-[10px]'>지하</label>
                    <input type="number" name="down" />
                </div>
                </div>
                        
                        
                        <label htmlFor="tel" className='text-[20px] mb-[10px]'>전화번호</label>
                        <label htmlFor="permission" className='text-[20px] mb-[10px]'>권한 설정</label>
            </div>
        </div>
    );
}