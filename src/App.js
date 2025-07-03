import React, { useState } from "react";
import "./App.css";

// TODOS LOS PARÁMETROS EDITABLES POR EL ADMINISTRADOR
const initialParams = {
  cups_por_comunidad: 2.2,              // NUEVO: promedio de CUPS por comunidad
  pct_20td_menos_10kw: 0.45,
  pct_20td_mas_10kw: 0.40,
  pct_30td: 0.15,
  consumo_20td_menos_10kw: 4500,
  consumo_20td_mas_10kw: 15000,
  consumo_30td: 40000,
  precio_propuesto: 0.155,
  honorario_20td_menos_10kw: 24.0,
  honorario_20td_mas_10kw: 73.2,
  honorario_30td: 186.0
};

function App() {
  const [numComunidades, setNumComunidades] = useState("");
  const [precioActual, setPrecioActual] = useState("");
  const [resultados, setResultados] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [params, setParams] = useState(initialParams);

  const handleCalcular = () => {
    const comunidades = parseFloat(numComunidades);
    const precio = parseFloat(precioActual);

    if (isNaN(comunidades) || comunidades <= 0 || isNaN(precio) || precio <= 0) {
      alert("Introduce valores válidos");
      return;
    }

    // NUEVO: calcula CUPS a partir de comunidades * cups_por_comunidad
    const totalCUPS = comunidades * params.cups_por_comunidad;

    // Reparto de CUPS por tarifa
    const cups20tdMenos10kw = Math.round(totalCUPS * params.pct_20td_menos_10kw);
    const cups20tdMas10kw = Math.round(totalCUPS * params.pct_20td_mas_10kw);
    const cups30td = Math.round(totalCUPS - cups20tdMenos10kw - cups20tdMas10kw);

    // Consumos
    const consumo20tdMenos10kw = cups20tdMenos10kw * params.consumo_20td_menos_10kw;
    const consumo20tdMas10kw = cups20tdMas10kw * params.consumo_20td_mas_10kw;
    const consumo30td = cups30td * params.consumo_30td;
    const consumoTotal = consumo20tdMenos10kw + consumo20tdMas10kw + consumo30td;

    // Cálculos
    const gastoActual = consumoTotal * precio;
    const gastoPropuesta = consumoTotal * params.precio_propuesto;
    const ahorro = gastoActual - gastoPropuesta;

    // Honorarios por tarifa
    const honorarios20tdMenos10kw = cups20tdMenos10kw * params.honorario_20td_menos_10kw;
    const honorarios20tdMas10kw = cups20tdMas10kw * params.honorario_20td_mas_10kw;
    const honorarios30td = cups30td * params.honorario_30td;
    const honorariosTotales =
      honorarios20tdMenos10kw + honorarios20tdMas10kw + honorarios30td;

    setResultados({
      comunidades,
      totalCUPS,
      cups20tdMenos10kw,
      cups20tdMas10kw,
      cups30td,
      consumoTotal,
      gastoActual,
      gastoPropuesta,
      ahorro,
      honorarios20tdMenos10kw,
      honorarios20tdMas10kw,
      honorarios30td,
      honorariosTotales
    });
  };

  const handleAdminLogin = () => {
    if (adminPass === "admin123") {
      setAdminMode(true);
      setAdminPass("");
    } else {
      alert("Clave incorrecta.");
    }
  };

  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  return (
    <div className="container" style={{ fontFamily: "'Calibri', Arial, sans-serif" }}>
      <div className="logo-centro">
        <img src="/logo.png" alt="Logo Multienergía Verde" style={{ maxWidth: 200 }} />
      </div>
      <h2 style={{ textAlign: "center" }}>
        Cálculo online de honorarios y ahorro para Administradores de Fincas
      </h2>
      <div className="simulador">
        <div>
          <label>Nº de comunidades: </label>
          <input
            type="number"
            min="1"
            value={numComunidades}
            onChange={(e) => setNumComunidades(e.target.value)}
          />
        </div>
        <div>
          <label>Precio de energía actual (€/kWh): </label>
          <input
            type="number"
            min="0.01"
            value={precioActual}
            onChange={(e) => setPrecioActual(e.target.value)}
            step="0.001"
          />
        </div>
        <button onClick={handleCalcular}>Calcular</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {!adminMode ? (
          <div>
            <input
              type="password"
              placeholder="Clave admin"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              style={{ marginRight: 8 }}
            />
            <button onClick={handleAdminLogin}>Entrar como admin</button>
          </div>
        ) : (
          <div className="admin-panel">
            <h4>Parámetros editables (solo admin)</h4>
            {Object.entries(params).map(([key, val]) => (
              <div key={key}>
                <label>{key.replace(/_/g, " ")}: </label>
                <input
                  type="number"
                  name={key}
                  value={val}
                  onChange={handleParamsChange}
                  step="0.01"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {resultados && (
        <div className="resultados" style={{ marginTop: 24 }}>
          <h3>Resultados</h3>
          <p>
            <b>Total de comunidades:</b> {resultados.comunidades}
            <br />
            <b>Total de CUPS estimados:</b> {resultados.totalCUPS}
            <br />
            <b>CUPS tarifa 2.0TD &lt;10kW:</b> {resultados.cups20tdMenos10kw}
            <br />
            <b>CUPS tarifa 2.0TD &gt;10kW:</b> {resultados.cups20tdMas10kw}
            <br />
            <b>CUPS tarifa 3.0TD:</b> {resultados.cups30td}
          </p>
          <p>
            <b>Consumo total estimado:</b> {resultados.consumoTotal.toLocaleString()} kWh/año
            <br />
            <b>Gasto anual actual:</b> {resultados.gastoActual.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
            <br />
            <b>Gasto anual con propuesta:</b> {resultados.gastoPropuesta.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
            <br />
            <b>Ahorro estimado:</b> {resultados.ahorro.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
          </p>
          <p>
            <b>Honorarios 2.0TD &lt;10kW:</b> {resultados.honorarios20tdMenos10kw.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
            <br />
            <b>Honorarios 2.0TD &gt;10kW:</b> {resultados.honorarios20tdMas10kw.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
            <br />
            <b>Honorarios 3.0TD:</b> {resultados.honorarios30td.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
            <br />
            <b>Honorarios TOTALES:</b> {resultados.honorariosTotales.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} €
          </p>
          <div style={{marginTop: 12}}>
            <b>Multienergía Verde, la 1ª comercializadora de los AAFF desde hace más de 10 años.</b>
            <br />
            Un cordial saludo,<br />
            Dpto. Ofertas | Multienergía Verde<br />
            Móvil 600 36 50 81
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

