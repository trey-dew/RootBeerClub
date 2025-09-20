import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import MobileNavigation from './components/MobileNavigation';
import HomePage from './components/HomePage';
import RootBeerListPage from './components/RootBeerListPage';
import RootBeerDetailsPage from './components/RootBeerDetailsPage';
import ScorecardPage from './components/ScorecardPage';
import LoginPage from './components/LoginPage';
import { UserProvider } from './components/UserContext';
import JudgesPage from './components/JudgesPage';
import JudgeProfilePage from './components/JudgeProfilePage';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-lg fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <Link to="/" className="text-2xl font-bold text-rootbeer-700">
                  Root Beer Club
                </Link>
                <Navigation />
                <MobileNavigation />
              </div>
            </div>
          </header>
          <main className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/rootbeers" element={<RootBeerListPage />} />
              <Route path="/scorecard" element={<ScorecardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/rootbeers/:rootbeer_id" element={<RootBeerDetailsPage />} />
              <Route path="/judges" element={<JudgesPage />} />
              <Route path="/judges/:judgeId" element={<JudgeProfilePage />} />
              {/* Add catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
