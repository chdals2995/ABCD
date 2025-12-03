import Menu from '../components/adminskin/Menu';
import TopMenu from '../components/adminskin/TopMenu';
import logo from '../assets/logos/logo.png';

export default function AdminLayout(){
    return(
        <div>
            <Menu/>
            <TopMenu/>
        </div>
    );
}