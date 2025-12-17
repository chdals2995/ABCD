//AdminLayout
import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';


export default function AdminLayout({MainLogo, logoSize}){
    return(
        <div>
            <Menu customLogo={MainLogo}
                logoClass={logoSize}/>
            <TopMenu/>
        </div>
    );
}