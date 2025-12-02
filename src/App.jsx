import { useState } from "react";
import Button from "./assets/Button";

import "./App.css";
import Select from "./assets/Select";

//버튼 클릭 테스트 함수
const onClick = () => {
  alert("버튼 클릭됨");
};

//셀렉트 선택 테스트 함수
const options = [
  { value: "1", label: "2층 201호 앞 복도" },
  { value: "2", label: "2번" },
  { value: "3", label: "3번" },
];

function App() {
  const [number, setNumber] = useState(0);
  return (
    <>
      <Button onClick={onClick}>qjxms</Button>
      <Select
        label={"셀랙트 박스"}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        options={options}
        placeholder="숫자를 선택하세요"
      />
    </>
  );
}

export default App;
