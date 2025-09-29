import Navbar from '../components/Navbar';
import JoinForm from './subPages/JoinForm';

const Payment: React.FC = () => {
    return (
        <>
            <Navbar message="Tidak punya akun?" buttonMessage="Daftar Akun" route='/signup'></Navbar>
            <JoinForm></JoinForm>
        </>
    )
}

export default Payment;