[1mdiff --git a/package-lock.json b/package-lock.json[m
[1mindex b167f8c5..7bed4824 100644[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@ -9,9 +9,13 @@[m
       "version": "0.0.0",[m
       "dependencies": {[m
         "chart.js": "^4.5.1",[m
[32m+[m[32m        "data-fns": "^1.1.0",[m
[32m+[m[32m        "date-fns": "^4.1.0",[m
[32m+[m[32m        "date-fns-tz": "^3.2.0",[m
         "firebase": "^12.6.0",[m
         "react": "^19.2.0",[m
         "react-chartjs-2": "^5.3.1",[m
[32m+[m[32m        "react-datepicker": "^8.10.0",[m
         "react-dom": "^19.2.0",[m
         "react-router-dom": "^7.9.6"[m
       },[m
[36m@@ -1518,6 +1522,59 @@[m
       "integrity": "sha512-+uGNN7rkfn41HLO0vekTFhTxk61eKa8mTpRGLO0QSqlQdKvIoGAvLp3ppdVIWbTGYJWM6Kp0iN+PjMIOcnVqTw==",[m
       "license": "Apache-2.0"[m
     },[m
[32m+[m[32m    "node_modules/@floating-ui/core": {[m
[32m+[m[32m      "version": "1.7.3",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@floating-ui/core/-/core-1.7.3.tgz",[m
[32m+[m[32m      "integrity": "sha512-sGnvb5dmrJaKEZ+LDIpguvdX3bDlEllmv4/ClQ9awcmCZrlx5jQyyMWFM5kBI+EyNOCDDiKk8il0zeuX3Zlg/w==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@floating-ui/utils": "^0.2.10"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@floating-ui/dom": {[m
[32m+[m[32m      "version": "1.7.4",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@floating-ui/dom/-/dom-1.7.4.tgz",[m
[32m+[m[32m      "integrity": "sha512-OOchDgh4F2CchOX94cRVqhvy7b3AFb+/rQXyswmzmGakRfkMgoWVjfnLWkRirfLEfuD4ysVW16eXzwt3jHIzKA==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@floating-ui/core": "^1.7.3",[m
[32m+[m[32m        "@floating-ui/utils": "^0.2.10"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@floating-ui/react": {[m
[32m+[m[32m      "version": "0.27.16",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@floating-ui/react/-/react-0.27.16.tgz",[m
[32m+[m[32m      "integrity": "sha512-9O8N4SeG2z++TSM8QA/KTeKFBVCNEz/AGS7gWPJf6KFRzmRWixFRnCnkPHRDwSVZW6QPDO6uT0P2SpWNKCc9/g==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@floating-ui/react-dom": "^2.1.6",[m
[32m+[m[32m        "@floating-ui/utils": "^0.2.10",[m
[32m+[m[32m        "tabbable": "^6.0.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "peerDependencies": {[m
[32m+[m[32m        "react": ">=17.0.0",[m
[32m+[m[32m        "react-dom": ">=17.0.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@floating-ui/react-dom": {[m
[32m+[m[32m      "version": "2.1.6",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@floating-ui/react-dom/-/react-dom-2.1.6.tgz",[m
[32m+[m[32m      "integrity": "sha512-4JX6rEatQEvlmgU80wZyq9RT96HZJa88q8hp0pBd+LrczeDI4o6uA2M+uvxngVHo4Ihr8uibXxH6+70zhAFrVw==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@floating-ui/dom": "^1.7.4"[m
[32m+[m[32m      },[m
[32m+[m[32m      "peerDependencies": {[m
[32m+[m[32m        "react": ">=16.8.0",[m
[32m+[m[32m        "react-dom": ">=16.8.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@floating-ui/utils": {[m
[32m+[m[32m      "version": "0.2.10",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@floating-ui/utils/-/utils-0.2.10.tgz",[m
[32m+[m[32m      "integrity": "sha512-aGTxbpbg8/b5JfU1HXSrbH3wXZuLPJcNEcZQFMxLs3oSzgtVu6nFPkbbGGUvBcUjKV2YyB9Wxxabo+HEH9tcRQ==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
     "node_modules/@grpc/grpc-js": {[m
       "version": "1.9.15",[m
       "resolved": "https://registry.npmjs.org/@grpc/grpc-js/-/grpc-js-1.9.15.tgz",[m
[36m@@ -2624,6 +2681,15 @@[m
         "node": ">=12"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/clsx": {[m
[32m+[m[32m      "version": "2.1.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=6"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/color-convert": {[m
       "version": "2.0.1",[m
       "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",[m
[36m@@ -2691,6 +2757,37 @@[m
       "dev": true,[m
       "license": "MIT"[m
     },[m
[32m+[m[32m    "node_modules/data-fns": {[m
[32m+[m[32m      "version": "1.1.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/data-fns/-/data-fns-1.1.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-/rJzdbnuY3DVgzqsfEfc+tJLuAKYaHzkUxSMRIU3dxKFeWGD/MGhrgAfuwSOmgfJ8enygztp9DeuvoSxauppIg==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "unit-fns": "^0.1.6"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=10"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/date-fns": {[m
[32m+[m[32m      "version": "4.1.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/date-fns/-/date-fns-4.1.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-Ukq0owbQXxa/U3EGtsdVBkR1w7KOQ5gIBqdH2hkvknzZPYvBxb/aa6E8L7tmjFtkwZBu3UXBbjIgPo/Ez4xaNg==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "funding": {[m
[32m+[m[32m        "type": "github",[m
[32m+[m[32m        "url": "https://github.com/sponsors/kossnocorp"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/date-fns-tz": {[m
[32m+[m[32m      "version": "3.2.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/date-fns-tz/-/date-fns-tz-3.2.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-sg8HqoTEulcbbbVXeg84u5UnlsQa8GS5QXMqjjYIhS4abEVVKIUwe0/l/UhrZdKaL/W5eWZNlbTeEIiOXTcsBQ==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "peerDependencies": {[m
[32m+[m[32m        "date-fns": "^3.0.0 || ^4.0.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/debug": {[m
       "version": "4.4.3",[m
       "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",[m
[36m@@ -3986,6 +4083,21 @@[m
         "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/react-datepicker": {[m
[32m+[m[32m      "version": "8.10.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/react-datepicker/-/react-datepicker-8.10.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-JIXuA+g+qP3c4MVJpx24o7n1gnv3WV/8A/D6964HucY1FlSEc30+ITPNUfbKZXYHl5rruCtxYCwi2lzn7gaz7g==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@floating-ui/react": "^0.27.15",[m
[32m+[m[32m        "clsx": "^2.1.1",[m
[32m+[m[32m        "date-fns": "^4.1.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "peerDependencies": {[m
[32m+[m[32m        "react": "^16.9.0 || ^17 || ^18 || ^19 || ^19.0.0-rc",[m
[32m+[m[32m        "react-dom": "^16.9.0 || ^17 || ^18 || ^19 || ^19.0.0-rc"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/react-dom": {[m
       "version": "19.2.0",[m
       "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.2.0.tgz",[m
[36m@@ -4234,6 +4346,12 @@[m
         "node": ">=8"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/tabbable": {[m
[32m+[m[32m      "version": "6.3.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/tabbable/-/tabbable-6.3.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-EIHvdY5bPLuWForiR/AN2Bxngzpuwn1is4asboytXtpTgsArc+WmSJKVLlhdh71u7jFcryDqB2A8lQvj78MkyQ==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
     "node_modules/tailwindcss": {[m
       "version": "4.1.17",[m
       "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.1.17.tgz",[m
[36m@@ -4297,6 +4415,15 @@[m
       "integrity": "sha512-Zz+aZWSj8LE6zoxD+xrjh4VfkIG8Ya6LvYkZqtUQGJPZjYl53ypCaUwWqo7eI0x66KBGeRo+mlBEkMSeSZ38Nw==",[m
       "license": "MIT"[m
     },[m
[32m+[m[32m    "node_modules/unit-fns": {[m
[32m+[m[32m      "version": "0.1.9",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/unit-fns/-/unit-fns-0.1.9.tgz",[m
[32m+[m[32m      "integrity": "sha512-bxceIkc7n2icQmgQx8u3vX98ZBIcpL2YJDKIsWDFK7ZX1TTuLvtNWVNd9/oARCDHd7QQRzwc+zxabO0HSK8X0w==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=10"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/update-browserslist-db": {[m
       "version": "1.1.4",[m
       "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.1.4.tgz",[m
[1mdiff --git a/package.json b/package.json[m
[1mindex a101393a..29d12d50 100644[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@ -11,9 +11,13 @@[m
   },[m
   "dependencies": {[m
     "chart.js": "^4.5.1",[m
[32m+[m[32m    "data-fns": "^1.1.0",[m
[32m+[m[32m    "date-fns": "^4.1.0",[m
[32m+[m[32m    "date-fns-tz": "^3.2.0",[m
     "firebase": "^12.6.0",[m
     "react": "^19.2.0",[m
     "react-chartjs-2": "^5.3.1",[m
[32m+[m[32m    "react-datepicker": "^8.10.0",[m
     "react-dom": "^19.2.0",[m
     "react-router-dom": "^7.9.6"[m
   },[m
[36m@@ -30,5 +34,4 @@[m
     "tailwindcss": "^4.1.17",[m
     "vite": "^7.2.4"[m
   }[m
[31m-  [m
 }[m
[1mdiff --git a/src/Component/Alarm/Alarm.jsx b/src/Component/Alarm/Alarm.jsx[m
[1mindex 13080a62..e53309bb 100644[m
[1m--- a/src/Component/Alarm/Alarm.jsx[m
[1m+++ b/src/Component/Alarm/Alarm.jsx[m
[36m@@ -8,15 +8,16 @@[m [mexport default function Alarm() {[m
   const [tab, setTab] = useState("request");[m
 [m
   return ([m
[31m-    <div [m
[31m-      className="[m
[31m-        absolute right-0 top-0 [m
[31m-        w-[371px] h-[919px][m
[31m-        bg-[#E6EEF2][m
[31m-        pt-[156px][m
[31m-      "[m
[32m+[m[41m    [m
[32m+[m[32m    <div className="absolute right-0 top-0 w-[371px] h-[919px][m
[32m+[m[32m    bg-[#E6EEF2][m
[32m+[m[32m    pt-[156px][m
[32m+[m[32m    "[m
     >[m
[31m-      <AdminLayout />[m
[32m+[m[32m    <AdminLayout />[m
[32m+[m
[32m+[m
[32m+[m[41m    [m
        <div className="flex flex-col items-center">[m
 [m
       [m
[1mdiff --git a/src/Log/Component/AlarmL.jsx b/src/Log/Component/AlarmL.jsx[m
[1mindex 468e8960..df7c954b 100644[m
[1m--- a/src/Log/Component/AlarmL.jsx[m
[1m+++ b/src/Log/Component/AlarmL.jsx[m
[36m@@ -1,47 +1,64 @@[m
 // AlarmL.jsx[m
[31m-import { useState } from "react";[m
[31m-[m
[31m-export default function AlarmL({ row, index, editMode, selected, setSelected }) {[m
[31m-  const colors = {[m
[31m-    접수: "text-[#25C310]",[m
[31m-    처리중: "text-[#FF3B3B]",[m
[31m-    완료: "text-[#367CFF]",[m
[31m-  };[m
[31m-[m
[31m-  const toggle = () => {[m
[31m-    if (selected.includes(row.id)) {[m
[31m-      setSelected(selected.filter((id) => id !== row.id));[m
[31m-    } else {[m
[31m-      setSelected([...selected, row.id]);[m
[31m-    }[m
[31m-  };[m
[31m-[m
[31m-  // row.content 안에 "글자크기:XXpx" 같은 패턴 제거[m
[31m-  const cleanedContent = row.content?.replace(/글자\s*크기\s*:\s*\d+px/gi, "");[m
[32m+[m[32mimport choiceIcon from "../../icons/choice_icon.png";[m
 [m
[32m+[m[32mexport default function AlarmL({ row, checked, toggleRow }) {[m
   return ([m
[31m-    <div className="grid grid-cols-6 items-center h-[58px] border-b text-[20px]">[m
[32m+[m[32m    <div[m
[32m+[m[32m      className="[m
[32m+[m[32m        grid[m
[32m+[m[32m        grid-cols-[60px_80px_200px_1fr_200px_150px][m
[32m+[m[32m        text-[22px][m
[32m+[m[32m        py-3[m
[32m+[m[32m        border-b[m
[32m+[m[32m        items-center[m
[32m+[m[32m        w-full[m
[32m+[m[32m      "[m
[32m+[m[32m    >[m
 [m
[31m-      {/* No. */}[m
[31m-      <div className="w-[60px] text-center">{index}</div>[m
[32m+[m[32m      {/* No */}[m
[32m+[m[32m      <div className="text-center">{row.id}</div>[m
 [m
[31m-      {/* 체크박스 (수정모드일 때만 표시) */}[m
[31m-      <div className="w-[80px] flex justify-center">[m
[31m-        {editMode && <input type="checkbox" onChange={toggle} className="scale-150" />}[m
[32m+[m[32m      {/* 체크박스 - 박스는 항상 같고, 안에 체크 아이콘만 들어감 */}[m
[32m+[m[32m      <div[m
[32m+[m[32m        className="flex justify-center cursor-pointer"[m
[32m+[m[32m        onClick={toggleRow}[m
[32m+[m[32m      >[m
[32m+[m[32m        <div className="[m
[32m+[m[32m          w-[25px] h-[25px][m[41m [m
[32m+[m[32m          rounded-[3px][m
[32m+[m[32m          bg-[#C8C8C8][m
[32m+[m[32m          flex items-center justify-center[m
[32m+[m[32m        ">[m
[32m+[m[32m          {checked && ([m
[32m+[m[32m            <img src={choiceIcon} className="w-[14px] h-[14px]" />[m
[32m+[m[32m          )}[m
[32m+[m[32m        </div>[m
       </div>[m
 [m
       {/* 아이디 */}[m
[31m-      <div className="w-[200px] text-center">{row.user}</div>[m
[32m+[m[32m      <div className="text-center truncate">{row.user}</div>[m
 [m
[31m-      {/* 내용 (글자크기 문구 자동 제거됨) */}[m
[31m-      <div className="flex-1">{cleanedContent}</div>[m
[32m+[m[32m      {/* 내용 */}[m
[32m+[m[32m      <div className="pl-2 whitespace-nowrap overflow-hidden">[m
[32m+[m[32m        {row.content || ""}[m
[32m+[m[32m      </div>[m
 [m
       {/* 등록일 */}[m
[31m-      <div className="w-[200px] text-center">{row.date}</div>[m
[32m+[m[32m      <div className="text-center">{row.date}</div>[m
 [m
[31m-      {/* 상태 텍스트 */}[m
[31m-      <div className="w-[150px] flex justify-center items-center">[m
[31m-        <span className={colors[row.status]}>{row.status}</span>[m
[32m+[m[32m      {/* 상태 */}[m
[32m+[m[32m      <div className="text-center">[m
[32m+[m[32m        <span[m
[32m+[m[32m          className={[m
[32m+[m[32m            row.status === "접수"[m
[32m+[m[32m              ? "text-[#25C310]"[m
[32m+[m[32m              : row.status === "처리중"[m
[32m+[m[32m              ? "text-[#FF3B3B]"[m
[32m+[m[32m              : "text-[#367CFF]"[m
[32m+[m[32m          }[m
[32m+[m[32m        >[m
[32m+[m[32m          {row.status}[m
[32m+[m[32m        </span>[m
       </div>[m
     </div>[m
   );[m
[1mdiff --git a/src/Log/Component/AlarmLog.jsx b/src/Log/Component/AlarmLog.jsx[m
[1mindex fac98c58..d89390df 100644[m
[1m--- a/src/Log/Component/AlarmLog.jsx[m
[1m+++ b/src/Log/Component/AlarmLog.jsx[m
[36m@@ -1,34 +1,182 @@[m
 // AlarmLog.jsx[m
[31m-import AlarmL from "./AlarmL";[m
[32m+[m[32mimport { useState,useRef } from "react";[m
[32m+[m[32mimport choiceIcon from "../../icons/choice_icon.png";[m[41m [m
[32m+[m[32mimport CalendarIcon from "../../icons/Calendar_icon.png";[m
[32m+[m[32mimport AlarmL from "./AlarmL.jsx";[m
[32m+[m[32mimport DatePicker from "react-datepicker";[m
[32m+[m[32mimport "react-datepicker/dist/react-datepicker.css";[m
[32m+[m[32mimport { ko } from "date-fns/locale";[m
[32m+[m
 [m
 export default function AlarmLog() {[m
[31m-  // 더미 데이터 (추후 DB 연동)[m
[32m+[m[41m  [m
   const data = [[m
[31m-    { id: 1, user: "qeaowymu", content: "글자크기:20px", date: "2024-10-13", status: "접수" },[m
[32m+[m[32m    { id: 1, user: "qeaowymu", content: "", date: "2024-10-13", status: "접수" },[m
     { id: 2, user: "evuopugh", content: "", date: "2021-04-05", status: "처리중" },[m
     { id: 3, user: "wbbtoafk", content: "", date: "2022-07-22", status: "처리중" },[m
     { id: 4, user: "k4xxdnh6", content: "", date: "2025-08-31", status: "접수" },[m
     { id: 5, user: "wev5peal", content: "", date: "2019-12-11", status: "완료" },[m
   ];[m
 [m
[32m+[m[32m  const [checkedRows, setCheckedRows] = useState(Array(data.length).fill(false));[m
[32m+[m[32m  const [isAllChecked, setIsAllChecked] = useState(false);[m
[32m+[m
[32m+[m[32m  const toggleAll = () => {[m
[32m+[m[32m    const newValue = !isAllChecked;[m
[32m+[m[32m    setIsAllChecked(newValue);[m
[32m+[m[32m    setCheckedRows(Array(data.length).fill(newValue));[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  const toggleRow = (index) => {[m
[32m+[m[32m    const updated = [...checkedRows];[m
[32m+[m[32m    updated[index] = !updated[index];[m
[32m+[m[32m    setCheckedRows(updated);[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  // 날짜 상태 만들기[m[41m [m
[32m+[m[32m  const [selectedDate, setSelectedDate] = useState(null);[m
[32m+[m[32m  const datePickerRef = useRef(null);[m
[32m+[m
   return ([m
[31m-    <div className="w-[1429px] border-t border-[#D0D0D0]">[m
[31m-[m
[31m-      {/* 테이블 헤더 */}[m
[31m-      <div className="grid grid-cols-6 text-[26px] font-semibold py-3 border-b">[m
[31m-        <div className="w-[60px] text-center">No.</div>[m
[31m-        <div className="w-[80px] text-center">✔</div>[m
[31m-        <div className="w-[200px] text-center">아이디</div>[m
[31m-        <div className="flex-1 text-left">내용</div>[m
[31m-        <div className="w-[200px] text-center">등록일</div>[m
[31m-        <div className="w-[150px] text-center">상태</div>[m
[32m+[m[32m    <div className="w-full max-w-[1100px] mx-auto overflow-x-hidden mt-[101px] mb-[40px]">[m
[32m+[m
[32m+[m[32m      {/* 필터 영역 */}[m
[32m+[m[32m      <div className="flex justify-between items-center mb-4 text-[18px]">[m
[32m+[m
[32m+[m[32m       {/* 왼쪽 필터영역 */}[m
[32m+[m[32m       <div className="flex items-center gap-4">[m
[32m+[m
[32m+[m[32m        {/* 전체 */}[m
[32m+[m[32m        <button className="text-[#054E76] font-semibold">[m
[32m+[m[32m          전체[m
[32m+[m[32m        </button>[m
[32m+[m
[32m+[m[32m        {/* 구분선 */}[m
[32m+[m[32m        <div className="w-[2px] h-[20px] bg-[#b5b5b5]"></div>[m
[32m+[m
[32m+[m[41m  [m
[32m+[m
[32m+[m[32m        {/* 날짜 선택  */}[m
[32m+[m[32m        <div[m[41m [m
[32m+[m[32m          className="flex items-center gap-2 cursor-pointer"[m
[32m+[m[32m          onClick={() => datePickerRef.current.setOpen(true)}>[m
[32m+[m[32m          <span className="text-gray-600">[m
[32m+[m[32m            날짜 {selectedDate ? selectedDate.toISOString().slice(0,10).replace(/-/g,".") : "2025.01.01"}[m
[32m+[m[32m          </span>[m
[32m+[m
[32m+[m[32m          <img[m[41m [m
[32m+[m[32m            src={CalendarIcon}[m
[32m+[m[32m            alt={"달력 아이콘"}[m
[32m+[m[32m            className="w-[35px] h-[35px]"[m
[32m+[m[41m            [m
[32m+[m[32m            />[m
[32m+[m[32m          <DatePicker[m
[32m+[m[32m            ref={datePickerRef}[m
[32m+[m[32m            selected={selectedDate}[m
[32m+[m[32m            onChange={(date) => setSelectedDate(date)}[m
[32m+[m[32m            locale={ko}[m
[32m+[m[32m            className="hidden"[m
[32m+[m[32m            dateFormat="yyyy.MM.dd"[m
[32m+[m[32m            renderCustomHeader={({ date, decreaseMonth, increaseMonth }) =>[m[41m [m
[32m+[m[32m              ([m
[32m+[m[32m            <div className="flex justify-between items-center px-3 py-2 bg-[#F7F9FA] border-b border-gray-300 rounded-t-lg">[m
[32m+[m
[32m+[m[32m            {/* 이전 달 버튼 */}[m
[32m+[m[32m            <button[m
[32m+[m[32m              onClick={decreaseMonth}[m
[32m+[m[32m              className="p-2 rounded-md hover:bg-white border border-gray-300"[m
[32m+[m[32m            >[m
[32m+[m[32m            이전[m
[32m+[m[32m            </button>[m
[32m+[m
[32m+[m[32m            {/* 월/연도 표시 */}[m
[32m+[m[32m            <span className="text-gray-800 font-semibold text-[16px]">[m
[32m+[m[32m              {date.getFullYear()}년 {date.getMonth() + 1}월[m
[32m+[m[32m            </span>[m
[32m+[m
[32m+[m[32m            {/* 다음 달 버튼 */}[m
[32m+[m[32m            <button[m
[32m+[m[32m              onClick={increaseMonth}[m
[32m+[m[32m              className="p-2 rounded-md hover:bg-white border border-gray-300"[m
[32m+[m[32m            >[m
[32m+[m[32m             다음[m
[32m+[m[32m            </button>[m
[32m+[m[32m        </div>[m
[32m+[m[32m      )}[m
[32m+[m[32m    />[m
[32m+[m[32m  </div>[m
[32m+[m
[32m+[m[32m       </div>[m
[32m+[m[32m        {/* 오른쪽 처리현황 필터 */}[m
[32m+[m[32m        <div className="flex items-center gap-4 text-[18px]">[m
[32m+[m
[32m+[m[32m          <button>접수</button>[m
[32m+[m
[32m+[m[32m          {/* 구분선 */}[m
[32m+[m[32m          <div className="w-[2px] h-[20px] bg-[#b5b5b5]"></div>[m
[32m+[m
[32m+[m[32m          <button>처리중</button>[m
[32m+[m
[32m+[m[32m          {/* 구분선 */}[m
[32m+[m[32m          <div className="w-[2px] h-[20px] bg-[#b5b5b5]"></div>[m
[32m+[m
[32m+[m[32m          <button>완료</button>[m
[32m+[m
[32m+[m[32m        </div>[m
[32m+[m
[32m+[m
[32m+[m[32m      </div>[m
[32m+[m
[32m+[m[32m      {/* 파란 헤더 — flex → grid로 변경 */}[m
[32m+[m[32m      <div[m
[32m+[m[32m        className="[m
[32m+[m[32m          grid[m[41m [m
[32m+[m[32m          grid-cols-[60px_80px_200px_1fr_200px_150px][m
[32m+[m[32m          h-[48px][m
[32m+[m[32m          bg-[#054E76][m
[32m+[m[32m          text-white[m
[32m+[m[32m          text-[20px][m
[32m+[m[32m          font-bold[m
[32m+[m[32m          items-center[m
[32m+[m[32m        "[m
[32m+[m[32m      >[m
[32m+[m[32m        <div className="text-center">No.</div>[m
[32m+[m
[32m+[m[32m        {/* 전체 체크박스 */}[m
[32m+[m[32m          <div[m
[32m+[m[32m            className="flex justify-center cursor-pointer"[m
[32m+[m[32m            onClick={toggleAll}[m
[32m+[m[32m          >[m
[32m+[m[32m            <div[m
[32m+[m[32m              className="[m
[32m+[m[32m                w-[25px] h-[25px][m
[32m+[m[32m                rounded-[3px][m
[32m+[m[32m                bg-[#D9D9D9][m
[32m+[m[32m                flex items-center justify-center[m
[32m+[m[32m              "[m
[32m+[m[32m            >[m
[32m+[m[32m              {isAllChecked && ([m
[32m+[m[32m                <img src={choiceIcon} className="w-[14px] h-[14px]" />[m
[32m+[m[32m              )}[m
[32m+[m[32m            </div>[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m
[32m+[m[32m        <div className="text-center">아이디</div>[m
[32m+[m[32m        <div className="text-center">내용</div>[m
[32m+[m[32m        <div className="text-center">등록일</div>[m
[32m+[m[32m        <div className="text-center">상태</div>[m
       </div>[m
 [m
       {/* 리스트 */}[m
       {data.map((row, idx) => ([m
[31m-        <AlarmL key={row.id} row={row} index={idx + 1} />[m
[32m+[m[32m        <AlarmL[m
[32m+[m[32m          key={row.id}[m
[32m+[m[32m          row={row}[m
[32m+[m[32m          checked={checkedRows[idx]}[m
[32m+[m[32m          toggleRow={() => toggleRow(idx)}[m
[32m+[m[32m        />[m
       ))}[m
[31m-[m
     </div>[m
   );[m
 }[m
[1mdiff --git a/src/Log/Component/Log.jsx b/src/Log/Component/Log.jsx[m
[1mindex 39e812d8..5785bbf0 100644[m
[1m--- a/src/Log/Component/Log.jsx[m
[1m+++ b/src/Log/Component/Log.jsx[m
[36m@@ -13,7 +13,7 @@[m [mexport default function Log() {[m
       <AdminLayout />[m
 [m
       {/* 상단 탭 */}[m
[31m-      <div className="flex gap-6 mb-6 text-[22px] font-bold">[m
[32m+[m[32m      <div className="flex justify-center gap-6 mb-6 text-[36px] font-bold">[m
         <button[m
           className={tab === "alarm" ? "text-[#054E76]" : "text-gray-400"}[m
           onClick={() => setTab("alarm")}[m
[1mdiff --git a/src/layout/AdminLayout.jsx b/src/layout/AdminLayout.jsx[m
[1mindex 80025e25..bc547821 100644[m
[1m--- a/src/layout/AdminLayout.jsx[m
[1m+++ b/src/layout/AdminLayout.jsx[m
[36m@@ -1,6 +1,6 @@[m
 import Menu from '../components/admin/Menu';[m
 import TopMenu from '../components/admin/TopMenu';[m
[31m-import logo from '../assets/logos/logo.png';[m
[32m+[m[32mimport Logo from '../assets/logos/logo.png';[m
 [m
 export default function AdminLayout(){[m
     return([m
