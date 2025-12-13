import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';


export default function AdminLayout({MainLogo, logoSize, floorGroups}){
    return(
        <div>
            <Menu customLogo={MainLogo}
                logoClass={logoSize}
                floorGroups={floorGroups}/>
            <TopMenu/>
        </div>
    );
}