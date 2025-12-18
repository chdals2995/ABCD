// src/problems/Problems.jsx
import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config.js";
import { useLocation, useNavigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout.jsx";
import TypeData from "./type_data.jsx";
import QuarterData from "./quarter_data.jsx";
import ProblemsLog from "./problems_log.jsx";
import UnsolvedList from "./unsolved_list.jsx";

import FilterIcon from "../icons/filter_icon.png";

/* =========================
   metric normalize (매핑 핵심)
========================= */
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

  return null;
}

/* =========================
   alerts / requests 교차 merge
========================= */
function interleaveMerge(alerts = [], requests = []) {
  const a = [...alerts].sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0));
  const r = [...requests].sort(
    (x, y) => (y.createdAt || 0) - (x.createdAt || 0)
  );

  const merged = [];
  let i = 0;
  let j = 0;
  let turn = (a[0]?.createdAt || 0) >= (r[0]?.createdAt || 0) ? "a" : "r";

  while (i < a.length || j < r.length) {
    if (turn === "a") {
      if (i < a.length) merged.push(a[i++]);
      turn = "r";
    } else {
      if (j < r.length) merged.push(r[j++]);
      turn = "a";
    }
    if (i >= a.length) turn = "r";
    if (j >= r.length) turn = "a";
  }
  return merged;
}

export default function Problems() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Menu에서 넘어온 metric
  const navMetric = location.state?.metric ?? null;

  // ✅ Alarm/UnsolvedList에서 넘어온 값
  const fromAlarm = location.state?.from === "alarm";
  const kindFromAlarm = location.state?.kind ?? null; // "alert" | "request"
  const alarmProblemId = location.state?.problemId ?? null;
  const alarmRequestId = location.state?.requestId ?? null;

  /* =========================
     상단 필터
  ========================= */
  const [selectedMetric, setSelectedMetric] = useState("all");

  // ✅ 메뉴에서 넘어온 metric 반영 (알람 유입보다 우선순위 낮게)
  useEffect(() => {
    if (fromAlarm) return;
    const mapped = normalizeMetric(navMetric);
    if (mapped) setSelectedMetric(mapped);
  }, [fromAlarm, navMetric]);

  /* =========================
     problems (타입별)
  ========================= */
  const [problemsByType, setProblemsByType] = useState({
    전력: [],
    온도: [],
    수도: [],
    가스: [],
  });

  useEffect(() => {
    const rootRef = ref(rtdb, "problems");

    return onValue(rootRef, (snapshot) => {
      const root = snapshot.val() || {};
      const next = { 전력: [], 온도: [], 수도: [], 가스: [] };

      Object.entries(root).forEach(([typeKey, byId]) => {
        if (!byId) return;

        Object.entries(byId).forEach(([id, data]) => {
          if (!data) return;

          const item = {
            id: data.id ?? id,
            ...data,
            type: data.type ?? typeKey,
            status: data.status ?? "미완료",
          };

          if (next[item.type]) next[item.type].push(item);
        });
      });

      Object.keys(next).forEach((k) => {
        next[k].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      });

      setProblemsByType(next);

      // ✅ alert 문제(id)로 들어온 경우: 해당 타입으로 필터 자동 이동
      if (fromAlarm && alarmProblemId) {
        const foundType = ["전력", "온도", "수도", "가스"].find((t) =>
          next[t].some((p) => p.id === alarmProblemId)
        );
        if (foundType) setSelectedMetric(foundType);
      }
    });
  }, [fromAlarm, alarmProblemId]);

  /* =========================
     현재 problems
  ========================= */
  const problems = useMemo(() => {
    if (selectedMetric === "all") {
      return [
        ...problemsByType.전력,
        ...problemsByType.온도,
        ...problemsByType.수도,
        ...problemsByType.가스,
      ].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    return problemsByType[selectedMetric] ?? [];
  }, [problemsByType, selectedMetric]);

  /* =========================
     타입별 카운트
  ========================= */
  const typeData = useMemo(
    () => ({
      전력: problemsByType.전력.length,
      온도: problemsByType.온도.length,
      수도: problemsByType.수도.length,
      가스: problemsByType.가스.length,
    }),
    [problemsByType]
  );

  /* =========================
     🚨 미해결 alerts
========================= */
  const [unsolvedAlerts, setUnsolvedAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");

    return onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setUnsolvedAlerts([]);

      const list = [];

      Object.entries(data).forEach(([floor, dates]) => {
        Object.entries(dates || {}).forEach(([dateKey, alerts]) => {
          Object.entries(alerts || {}).forEach(([id, v]) => {
            if (!v) return;
            if (v.status === "done") return;

            list.push({
              uid: `alert:${floor}:${dateKey}:${id}`,
              id,
              kind: "alert",
              metric: normalizeMetric(v.metric) || v.metric,
              level: v.level,
              floor,
              dateKey,
              createdAt: Number(v.createdAt) || 0,
              reason: v.reason,
            });
          });
        });
      });

      list.sort((a, b) => b.createdAt - a.createdAt);
      setUnsolvedAlerts(list);
    });
  }, []);

  /* =========================
     📩 미해결 requests
========================= */
  const [unsolvedRequests, setUnsolvedRequests] = useState([]);

  useEffect(() => {
    const requestsRef = ref(rtdb, "requests");

    return onValue(requestsRef, (snapshot) => {
      const list = [];

      snapshot.forEach((child) => {
        const v = child.val() || {};
        if (!["접수", "처리중"].includes(v.status)) return;

        list.push({
          uid: `request:${child.key}`,
          id: child.key,
          kind: "request",
          metric: normalizeMetric(v.type) || v.type,
          floor: v.floor,
          createdAt: Number(v.createdAt) || 0,
          reason: v.title || v.content,
          status: v.status,
        });
      });

      list.sort((a, b) => b.createdAt - a.createdAt);
      setUnsolvedRequests(list);
    });
  }, []);

  /* =========================
     request 알람 유입 시 metric 반영
  ========================= */
  useEffect(() => {
    if (!fromAlarm) return;
    if (kindFromAlarm !== "request") return;
    if (!alarmRequestId) return;

    const picked = unsolvedRequests.find((x) => x.id === alarmRequestId);
    const mapped = normalizeMetric(picked?.metric);
    if (mapped) setSelectedMetric(mapped);
  }, [fromAlarm, kindFromAlarm, alarmRequestId, unsolvedRequests]);

  const unsolvedItems = useMemo(
    () => interleaveMerge(unsolvedAlerts, unsolvedRequests),
    [unsolvedAlerts, unsolvedRequests]
  );

  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");

  // ✅ 폭 조절용 (원하면 여기만 숫자 조절)
  const LEFT_CHART_W = 420; // 파이 박스 폭(여기 늘리면 상단 좌측이 커짐)
  const RIGHT_ASIDE_W = 380; // 미해결 리스트 폭

  return (
    <div className="w-full h-full">
      <AdminLayout />

      <div className="ml-[330px] pt-6 px-6">
        <div className="w-full max-w-[1500px]">
          {/* ===== 상단 필터 ===== */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {["전체", "전력", "온도", "수도", "가스"].map((label) => {
              const value = label === "전체" ? "all" : label;
              const active = selectedMetric === value;

              return (
                <div key={label} className="flex justify-center">
                  <button
                    onClick={() => setSelectedMetric(value)}
                    className={`
                      w-[160px] h-[56px]
                      flex items-center justify-center gap-2
                      text-[28px] font-bold
                      rounded-[16px]
                      transition cursor-pointer
                      ${
                        active
                          ? "bg-white shadow-md text-[#054E76]"
                          : "text-[#999]"
                      }
                    `}
                  >
                    {label}
                    {active && value !== "all" && (
                      <img src={FilterIcon} className="w-[26px] h-[26px]" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ===== 본문: flex로 좌(메인) + 우(미해결) ===== */}
          <section className="flex items-start">
            {/* ✅ 좌측 메인: 폭 자동 확장 */}
            <div className="flex-1 min-w-0 max-w-[900px] mr-[100px]">
              {/* 상단: 파이 + 분기 */}
              <div className="flex items-start">
                <div style={{ width: LEFT_CHART_W }}>
                  <TypeData
                    data={typeData}
                    selectedMetric={selectedMetric}
                    items={problems}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <QuarterData
                    items={problems}
                    selectedMetric={
                      selectedMetric === "all" ? "전력" : selectedMetric
                    }
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>

              {/* ✅ 하단: 원인내역(타입별) — 좌측 메인 전체 폭으로! */}
              <div className="mt-6">
                <ProblemsLog
                  problems={problems}
                  fromAlarm={fromAlarm}
                  alarmProblemId={alarmProblemId}
                />
              </div>
            </div>

            {/* ✅ 우측: 미해결 고정폭 */}
            <div className="shrink-0" style={{ width: RIGHT_ASIDE_W }}>
              <UnsolvedList
                items={unsolvedItems}
                onSelectProblem={(id) => {
                  const picked = unsolvedItems.find((x) => x.id === id);
                  const kind = picked?.kind || "alert";

                  navigate("/problems", {
                    state: {
                      from: "alarm",
                      kind,
                      metric: normalizeMetric(picked?.metric) || null,
                      problemId: kind === "alert" ? id : null,
                      requestId: kind === "request" ? id : null,
                    },
                  });
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
