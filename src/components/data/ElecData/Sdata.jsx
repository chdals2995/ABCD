import Mdata from "./Mdata";
import Ddata from "./Ddata";
export default function Sdata({
    isOpen, 
    onClose,
    children,
    closeOnBackdrop = true,
}) {
 if (!isOpen) return null;  

 const handleBackGround = () => {
    if (closeOnBackdrop && onClose) onClose();
 };
    return(
        <div>
         <h1>Sdata</h1>
         <button></button>
         <Ddata></Ddata>
         <Mdata></Mdata>
        </div>
    )}