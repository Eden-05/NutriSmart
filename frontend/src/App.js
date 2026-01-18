import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="container">
      <div className="nav">
        <div className="nav-inner">
          <div className="brand">
            <div className="logo">NS</div>
            <div>
              NutriSmart
              <div className="mini">Smart diet planner</div>
            </div>
          </div>

          <div className="nav-actions">
            {!isLoggedIn ? (
              <>
                <button className="btn-ghost" onClick={() => alert("Demo: regisztrálj lent :)")}>
                  Regisztráció
                </button>
                <button className="btn" onClick={() => alert("Demo: jelentkezz be lent :)")}>
                  Bejelentkezés
                </button>
              </>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => alert("Demo: hamarosan étrend oldal :)")}>
                  Étrend
                </button>
                <button className="btn-ghost" onClick={() => setIsLoggedIn(false)}>
                  Kijelentkezés
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid">
        <div>
          <Home />
          {isLoggedIn ? <Profile /> : <Register />}
        </div>

        <div>
          {!isLoggedIn ? (
            <Login onLogin={() => setIsLoggedIn(true)} />
          ) : (
            <div className="card">
              <h2>Üdv újra! 🌿</h2>
              <p>
                Most már be vagy jelentkezve. Töltsd ki a profilt, és később ebből fogjuk számolni a napi
                kalória- és makróigényt.
              </p>
              <div className="divider" />
              <div className="mini">Következő: étrend generálás + backend összekötés</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div className="mini">© NutriSmart • Vizsgaremek</div>
          <div className="mini">UI demo (backend integráció később)</div>
        </div>
      </div>
    </div>
  );
}

export default App;
