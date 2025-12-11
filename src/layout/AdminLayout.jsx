<<<<<<< HEAD
import Menu from '../components/admin/Menu';
import TopMenu from '../components/admin/TopMenu';
import Logo from '../assets/logos/logo.png';
=======
import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';
>>>>>>> a2881fa7d07b7f3d1f4371e96ab01417ef69c738


export default function AdminLayout({MainLogo, logoSize}){
    return(
        <div>
            <Menu customLogo={MainLogo}
                logoClass={logoSize}/>
            <TopMenu/>
        </div>
    );
}