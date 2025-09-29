import MiniNavbar from '../components/miniNavbart';
import Navbar from '../components/Navbar';
import JoinForm from './subPages/JoinForm';
import TransactionHistoryList from './subPages/TransactionList';

const mockData = [
  {
    id: 1,
    date: '15 Mar 2025 Pukul 11:30 Wib',
    packageName: 'Paket 1 Tahun',
    amount: 'Rp500.000',
    method: 'Transfer',
  },
  {
    id: 2,
    date: '15 Mar 2024 Pukul 11:30 Wib',
    packageName: 'Paket 1 Tahun',
    amount: 'Rp500.000',
    method: 'Transfer',
  },
];

const TransactionHistory: React.FC = () => {
    return (
        <>
            <MiniNavbar></MiniNavbar>
            <Navbar message="Tidak punya akun?" buttonMessage="Daftar Akun" route='/signup'></Navbar>
            <TransactionHistoryList transactions={mockData}></TransactionHistoryList>
        </>
    )
}

export default TransactionHistory;