import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue } from "firebase/database";
import Button from '../../../assets/Button';



export default function Building(){
    

    return(
        <div>
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
                    <div className="flex justify-between">
                        <div className="w-[100px]">
                            <label htmlFor="up" className='text-[20px] mb-[10px]'>지상</label>
                            <input type="number" name="up" className="w-[60px]"/>
                        </div>
                        <div className="w-[100px]">
                            <label htmlFor="down" className='text-[20px] mb-[10px]'>지하</label>
                            <input type="number" name="down" className="w-[60px]"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="park" className='text-[20px] mb-[10px]'>주차타워</label>
                        <input type="radio" name="park"/>유
                        <input type="radio" name="park"/>무
                    </div>
                    <div>
                        <label htmlFor="parkf" className='text-[20px] mb-[10px]'>층수</label>
                        <input type="number" name="parkf"/>
                    </div>
                </div>
            </div>
            <div className='w-[79px] mx-auto mt-[29px]'>
                <Button>승인</Button>
            </div>
        </div>
    );
}