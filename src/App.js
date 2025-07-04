import React, { useState } from "react";
import "./App.css";

const initialParams = {
  cups_por_comunidad: 2.2,
  pct_20td_menos_10kw: 0.45,
  pct_20td_mas_10kw: 0.40,
  pct_30td: 0.15,
  consumo_20td_menos_10kw: 2400,
  consumo_20td_mas_10kw: 2400,
  consumo_30td: 7500,
  precio_propuesto: 0.118998,
  honorario_20td_menos_10kw: 24.0,
  honorario_20td_mas_10kw: 73.2,
  honorario_30td: 186.0
};

// Formato moneda SIEMPRE con punto en miles
function formatMoneda(valor) {
  const partes = Number(valor).toFixed(2).split(".");
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${partes[0]},${partes[1]}`;
}

function App() {
  const [numComunidades, setNumComunidades] = useState("");
  const [precioActual, setPrecioActual] = useState("0.20");
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

    // Total CUPS estimados redondeado
    const totalCUPS = Math.round(comunidades * params.cups_por_comunidad);

    // Reparto de CUPS por tarifa
    const cups20tdMenos10kw = Math.round(totalCUPS * params.pct_20td_menos_10kw);
    const cups20tdMas10kw = Math.round(totalCUPS * params.pct_20td_mas_10kw);
    const cups30td = totalCUPS - cups20tdMenos10kw - cups20tdMas10kw;

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
    const honorarios20tdMenos10kw = Number(cups20tdMenos10kw) * Number(params.honorario_20td_menos_10kw);
    const honorarios20tdMas10kw = Number(cups20tdMas10kw) * Number(params.honorario_20td_mas_10kw);
    const honorarios30td = Number(cups30td) * Number(params.honorario_30td);
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
      honorariosTotales,
    });
  };

  // ENVIAR POR EMAIL (abre correo predeterminado con resultados)
  const handleEmail = () => {
    if (!resultados) return;
    const subject = encodeURIComponent("Resultados Simulador Honorarios");
    const body = encodeURIComponent(`
Simulación para ${resultados.comunidades} comunidades (${resultados.totalCUPS} CUPS estimados):

CUPS tarifa 2.0TD <10kW: ${resultados.cups20tdMenos10kw}
CUPS tarifa 2.0TD >10kW: ${resultados.cups20tdMas10kw}
CUPS tarifa 3.0TD: ${resultados.cups30td}

Consumo total estimado: ${formatMoneda(resultados.consumoTotal)} kWh/año
Gasto anual actual: ${formatMoneda(resultados.gastoActual)} €
Gasto anual con propuesta: ${formatMoneda(resultados.gastoPropuesta)} €
Ahorro estimado: ${formatMoneda(resultados.ahorro)} €

Honorarios 2.0TD <10kW: ${formatMoneda(resultados.honorarios20tdMenos10kw)} €
Honorarios 2.0TD >10kW: ${formatMoneda(resultados.honorarios20tdMas10kw)} €
Honorarios 3.0TD: ${formatMoneda(resultados.honorarios30td)} €
Honorarios TOTALES: ${formatMoneda(resultados.honorariosTotales)} €

---
La 1ª comercializadora de los AAFF desde hace más de 10 años
Dpto. Ofertas | Multienergía Verde
Móvil 600 36 50 81
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
        <div
          className="resultados"
          style={{ marginTop: 24 }}
        >
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
            <b>Consumo total estimado:</b> {formatMoneda(resultados.consumoTotal)} kWh/año
            <br />
            <b>Gasto anual actual:</b> {formatMoneda(resultados.gastoActual)} €
            <br />
            <b>Gasto anual con propuesta:</b> {formatMoneda(resultados.gastoPropuesta)} €
            <br />
            <span className="verde-lima">
              <b>Ahorro estimado:</b> {formatMoneda(resultados.ahorro)} €
            </span>
          </p>
          <p>
            <b>Honorarios 2.0TD &lt;10kW:</b> {formatMoneda(resultados.honorarios20tdMenos10kw)} €
            <br />
            <b>Honorarios 2.0TD &gt;10kW:</b> {formatMoneda(resultados.honorarios20tdMas10kw)} €
            <br />
            <b>Honorarios 3.0TD:</b> {formatMoneda(resultados.honorarios30td)} €
            <br />
            <span className="verde-lima">
              <b>Honorarios TOTALES:</b> {formatMoneda(resultados.honorariosTotales)} €
            </span>
          </p>
          {/* Firma con logo, sin punto y sin saludo */}
          <div style={{marginTop: 24, textAlign: "center"}}>
            <img
              src="/logo.png"
              alt="Logo Multienergía Verde"
              style={{ maxWidth: 80, display: "block", margin: "0 auto 6px auto" }}
            />
            <div style={{ fontWeight: "bold", marginBottom: 2, marginTop: 4 }}>
              La 1ª comercializadora de los AAFF desde hace más de 10 años
            </div>
            <div>
              Dpto. Ofertas | Multienergía Verde<br />
              Móvil 600 36 50 81
            </div>
          </div>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button onClick={() => window.print()}>Descargar PDF</button>
            <button style={{marginLeft: 12}} onClick={handleEmail}>Enviar por email</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



