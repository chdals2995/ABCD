import { useState } from "react";
import Button from "./assets/Button";

import "./App.css";
const onClick = () => {
  alert("버튼 클릭됨");
};

function App() {
  return (
    <>
      <Button onClick={onClick}>qjxms</Button>
    </>
  );
}

export default App;
