import { useState } from "react";
import Button from "./assets/Button";
import Admin from "./layout/AdminLayout";

import "./App.css";
const onClick = () => {
  alert("버튼 클릭됨");
};

function App() {
  return (
    <>
      <Admin/>
      <Button onClick={onClick}>qjxms</Button>
    </>
  );
}

export default App;
