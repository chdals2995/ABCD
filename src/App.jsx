import { useState } from "react";
import Admin from "./layout/AdminLayout";

import "./App.css";
const onClick = () => {
  alert("버튼 클릭됨");
};

function App() {
  return (
    <>
      <Admin/>
    </>
  );
}

export default App;
