//AdminLayout
import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';


export default function AdminLayout({logoSize}){
    return(
        <div>
            <Menu
                logoSize={logoSize}/>
            <TopMenu/>
        </div>
    );
}