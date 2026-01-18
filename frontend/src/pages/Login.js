function Login({ onLogin }) {
    return (
      <div className="card">
        <h2>Bejelentkezés</h2>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Jelszó" />
        <button onClick={onLogin}>Belépés</button>
      </div>
    );
  }
  
  export default Login;
  