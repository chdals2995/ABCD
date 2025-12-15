import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';


export default function AdminLayout({logoSize, floorGroups}){
    return(
        <div>
            <Menu
                logoSize={logoSize}
                floorGroups={floorGroups}/>
            <TopMenu/>
        </div>
    );
}