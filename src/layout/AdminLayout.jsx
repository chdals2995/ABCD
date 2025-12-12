import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';
import Logo from '../assets/logos/logo.png';



export default function AdminLayout({MainLogo, logoSize}){
    return(
        <div>
            <Menu customLogo={MainLogo}
                logoClass={logoSize}/>
            <TopMenu/>
        </div>
    );
}