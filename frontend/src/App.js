import './App.css';
import MenuItems from './ui/MenuItems';
import AppRoutes from './routes/AppRoutes';
import Footer from './component/Footer';

function App() {
  return (
    <div className="App">
      <MenuItems />
      <div style={{ paddingTop: '84px' }}>{/** 최상단 메뉴바 용 패딩 */}
        <AppRoutes />
      </div>
      <Footer />
    </div>



  );
}

export default App;
