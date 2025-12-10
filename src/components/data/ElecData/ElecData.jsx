import { Link } from "react-router-dom";
import ElecError from "./ElecError";
import Tdata from "./Tdata";
import Pdata from "./Pdata";
import Sdata from "./Sdata";
import MaxData from "./MaxData";
import EmData from "./EmData";

export default function ElecData() {
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "rgba(5,78,118,0.1)",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 네비 */}
      <nav style={{ padding: "10px 20px" }}>
        <Link style={{ marginRight: "20px" }} to="/Data/WaterData">
          온도
        </Link>
        <Link style={{ marginRight: "20px" }} to="/Data/TempData">
          수도
        </Link>
        <Link style={{ marginRight: "20px" }} to="/Data/GasData">
          가스
        </Link>
      </nav>

      {/* 나머지 영역 전체에 카드들 가운데 배치 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center", // ⭐ 여기서 전체 박스 가운데 정렬
        }}
      >
        <div
          style={{
            width: "1619px",
            height: "810px",
            backgroundColor: "transparent",
            position: "relative",
          }}
        >
          {/* 위쪽 3개 카드 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center", // 오타 aliginItems → alignItems
              width: "1619px",
              height: "50%",
              backgroundColor: "transparent",
              position: "absolute",
              top: "5px",
              padding: "5px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                width: "529px",
                height: "390px",
                position: "relative",
                marginRight: "8px",
              }}
            >
              <ElecError />
            </div>

            <div
              style={{
                backgroundColor: "#ffffff",
                width: "529px",
                height: "390px",
                position: "relative",
              }}
            >
              <Sdata /> {/* 🔹 Modal을 쓰는 컴포넌트 */}
            </div>

            <div
              style={{
                backgroundColor: "#ffffff",
                width: "529px",
                height: "390px",
                position: "relative",
                marginLeft: "8px",
              }}
            >
              <Tdata />
            </div>
          </div>

          {/* 아래쪽 3개 카드 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "1619px",
              height: "50%",
              backgroundColor: "transparent",
              position: "absolute",
              padding: "5px",
              bottom: "5px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                width: "529px",
                height: "390px",
                position: "relative",
                marginRight: "8px",
                marginTop: "3px",
              }}
            >
              <Pdata />
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                width: "529px",
                height: "390px",
                position: "relative",
                marginTop: "3px",
              }}
            >
              <EmData />
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                width: "529px",
                height: "390px",
                position: "relative",
                marginLeft: "8px",
                marginTop: "3px",
              }}
            >
              <MaxData />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
