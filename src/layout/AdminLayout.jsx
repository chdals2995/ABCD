import Menu from '../components/admin/Menu';
import TopMenu from '../components/admin/TopMenu';
import logo from '../assets/logos/logo.png';

export default function AdminLayout(){
    return(
        <div>
            <div className='pt-[13px]'>
                <img src={logo} alt="홈" className='logo w-[216px] h-[84px] ml-[38px]'/>
            </div>
            <Menu/>
            <TopMenu/>
        </div>
    );
}