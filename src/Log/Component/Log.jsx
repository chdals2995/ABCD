import { useState } from "react";

export default function Log({item}) {
    const [isEdit, setIsEait] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(item.status);

    const statusColor = {
        "접수" : "text-[#25c310]",
        "처리중" : "text-[#ff3b3b]",
        "완료" : "text-[#367cff]"
    };

    return (
        <div className="flex justify-between items-center py-3 border-b">
            <span className="text-[16px]">{item.title}</span>

            <div className="flex items-center gap-4">
            {/* 평상시 표시 */}
            {!isEdit && (
                <span className={`text-[16px] ${statusColor[item.status]}`}>
                    {item.status}
                </span>
            )}

            {/* 수정 모드 */}
            {isEdit && (
                <div className="flex gap-3">
                    {["접수", "처리중", "완료"].map((s) => {
                        <button
                          key = {s}
                          onClick = { () => setSelectedStatus(s)}
                          className={`
                            px-2 py-1 text-[15px]
                            ${selectedStatus === s
                              ? "border-2 border-[#054e76] rounded-md text-[#054e76]"
                              : "text-gray-500"
                            }
                         `}
                         >
                            {s}
                         </button>
                      })}
                 </div>
            )}

            {/* 수정 ｜ 저장 버튼  */}
            {!isEdit ? (
                <button
                  onClick ={() => setIsEait(true)}
                  className="text-[14px] border px-2 py-1 rounded-md"
                  >
                    수정
                  </button>
            ) : (
                <button
                  onClick = {() => {
                    setIsEait(false);
                    console.log("저장된 상태:", selectedStatus);    
                  }}
                  className="text-[14px] border px-2 py-1 rounded-md bg-blue-100"
                >
                    저장
                </button>
            )}
            </div>
        </div>
    )
}