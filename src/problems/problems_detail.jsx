import { ref, update } from "firebase/database";
import { rtdb } from "../firebase/config";
import { toast } from "react-toastify";

export default function ProblemsDetail({ problem, onClose }) {
  if (!problem) return null;

  const handleResolve = async () => {
    try {
      /* 1️⃣ problems 완료 */
      await update(
        ref(rtdb, `problems/${problem.type}/${problem.id}`),
        {
          status: "완료",
          resolvedAt: Date.now(),
        }
      );

      /* 2️⃣ alerts 완료 */
      if (
        problem.source === "alert" &&
        problem.floor &&
        problem.dateKey &&
        problem.alertId
      ) {
        await update(
          ref(
            rtdb,
            `alerts/${problem.floor}/${problem.dateKey}/${problem.alertId}`
          ),
          {
            status: "done",
            check: true,
          }
        );
      }

      toast.success("문제가 해결 처리되었습니다.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("해결 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
      <div className="w-[420px] bg-white rounded-md p-6 shadow-lg">
        <h2 className="text-[22px] font-bold mb-4">
          문제 상세 정보
        </h2>

        <div className="flex flex-col gap-3 text-[16px]">
          <div>
            <span className="font-semibold">층: </span>
            {problem.floor}
          </div>
          <div>
            <span className="font-semibold">유형: </span>
            {problem.type}
          </div>
          <div>
            <span className="font-semibold">내용: </span>
            {problem.content}
          </div>
          <div>
            <span className="font-semibold">상태: </span>
            {problem.status === "완료" ? "완료" : "미완료"}
          </div>
          <div>
            <span className="font-semibold">발생 시간: </span>
            {problem.createdAt
              ? new Date(problem.createdAt).toLocaleString("ko-KR")
              : "-"}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {problem.status !== "완료" && (
            <button
              onClick={handleResolve}
              className="flex-1 py-2 bg-[#054E76] text-white rounded-md"
            >
              해결 처리
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 text-white rounded-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
