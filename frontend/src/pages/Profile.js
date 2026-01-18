import { useMemo, useState } from "react";

function Profile() {
  const heights = useMemo(() => {
    const list = [];
    for (let h = 140; h <= 210; h++) list.push(h);
    return list;
  }, []);

  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("loss"); // loss | gain | maintain
  const [activity, setActivity] = useState("medium");

  // kitöltöttség (extra UI)
  const filled =
    (sex ? 1 : 0) +
    (height ? 1 : 0) +
    (weight ? 1 : 0) +
    (goal ? 1 : 0) +
    (activity ? 1 : 0);

  const percent = Math.round((filled / 5) * 100);

  const goalLabel = {
    loss: "Fogyás",
    gain: "Tömegnövelés",
    maintain: "Szintentartás",
  };

  const handleSave = () => {
    // Demo: később ezt POST/PUT-tal külditek backendbe
    alert(
      `Mentve (demo):\n` +
        `Nem: ${sex}\n` +
        `Magasság: ${height} cm\n` +
        `Testsúly: ${weight || "-"} kg\n` +
        `Cél: ${goalLabel[goal]}\n` +
        `Aktivitás: ${activity}\n` +
        `Kitöltöttség: ${percent}%`
    );
  };

  return (
    <div className="card">
      <h2>Profil beállítások</h2>
      <p className="mini">
        Add meg az alap adataidat — később ebből számoljuk a napi kalóriát és a makrókat.
      </p>

      <label>Nem</label>
      <select value={sex} onChange={(e) => setSex(e.target.value)}>
        <option value="male">Férfi</option>
        <option value="female">Nő</option>
      </select>

      <div className="split">
        <div style={{ flex: 1 }}>
          <label>Magasság</label>
          <select
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          >
            {heights.map((h) => (
              <option key={h} value={h}>
                {h} cm
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label>Testsúly</label>
          <input
            type="number"
            min="30"
            max="300"
            placeholder="pl. 75"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      <label>Cél</label>
      <div className="pill-group">
        <button
          type="button"
          className={goal === "loss" ? "pill active" : "pill"}
          onClick={() => setGoal("loss")}
        >
          Fogyás
        </button>
        <button
          type="button"
          className={goal === "gain" ? "pill active" : "pill"}
          onClick={() => setGoal("gain")}
        >
          Tömegnövelés
        </button>
        <button
          type="button"
          className={goal === "maintain" ? "pill active" : "pill"}
          onClick={() => setGoal("maintain")}
        >
          Szintentartás
        </button>
      </div>

      <label>Aktivitási szint</label>
      <select value={activity} onChange={(e) => setActivity(e.target.value)}>
        <option value="low">Alacsony</option>
        <option value="medium">Közepes</option>
        <option value="high">Magas</option>
      </select>

      <div className="row">
        <button className="btn" onClick={handleSave}>
          Mentés
        </button>
        <div className="mini">Demo mód • backend integráció később</div>
      </div>

      <div className="divider" />
      <div className="row" style={{ alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div className="progress" style={{ ["--p"]: `${percent}%` }}>
            <div />
          </div>
        </div>
        <div className="mini">Profil kitöltöttség: {percent}%</div>
      </div>
    </div>
  );
}

export default Profile;
