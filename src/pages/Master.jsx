import JoinRequestList from "../components/Master/join/JoinRequestList";
import Management from "../components/Master/join/Management";
import AdminLayout from "../layout/AdminLayout";

export default function Master(){
    return(
        <>
            <AdminLayout/>
            <Management/>
            <JoinRequestList/>
        </>
    );
}