import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import RootBeerListPage from './components/RootBeerListPage';
import RootBeerDetailsPage from './components/RootBeerDetailsPage';
import ScorecardPage from './components/ScorecardPage';
import LoginPage from './components/LoginPage';
import { UserProvider } from './components/UserContext';
import JudgesPage from './components/JudgesPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/rootbeers" element={<RootBeerListPage />} />
              <Route path="/scorecard" element={<ScorecardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/rootbeers/:rootbeer_id" element={<RootBeerDetailsPage />} />
              <Route path="/judges" element={<JudgesPage />} /> {/* New Judges route */}
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
