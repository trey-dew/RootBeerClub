import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import RootBeerListPage from './components/RootBeerListPage';
import ScorecardPage from './components/ScorecardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rootbeers" element={<RootBeerListPage />} />
            <Route path="/scorecard" element={<ScorecardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
