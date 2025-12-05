import Menu from '../components/admin/Menu';
import TopMenu from '../components/admin/TopMenu';
import Logo from '../assets/logos/logo.png';

export default function AdminLayout(){
    return(
        <div>
            <Menu/>
            <TopMenu/>
        </div>
    );
}