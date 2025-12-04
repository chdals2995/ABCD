import JoinRequestList from "../components/Master/JoinRequestList";
import Management from "../components/Master/Management";
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