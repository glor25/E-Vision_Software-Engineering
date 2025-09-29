import Navbar from "../components/Navbar"

export const  Dashboard: React.FC = () => {
    return (
        <>
            <Navbar message="Tidak punya akun?" buttonMessage="Daftar Akun" route='/signup'></Navbar>
        </>
    );
}