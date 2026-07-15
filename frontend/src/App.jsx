import { useRef, useState } from "react";
import "./App.css";

function App() {
  const inputFile = useRef(null);
  const [procesando, setProcesando] = useState(false);
  const [imagenResultado, setImagenResultado] = useState(null);

  const seleccionarImagen = () => {
    inputFile.current.click();
  };

  const subirImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setProcesando(true);
    setImagenResultado(null);

    const datos = new FormData();
    datos.append("file", archivo);
    datos.append("upload_preset", "fondooff");

    try {
      const respuesta = await fetch(
        "https://api.cloudinary.com/v1_1/dfhbs5ren/image/upload",
        {
          method: "POST",
          body: datos,
        }
      );

      const resultado = await respuesta.json();

      if (resultado.secure_url) {
        // Transformación: convertir a PNG y quitar fondo
        const urlSinFondo = resultado.secure_url.replace(
          "/upload/",
          "/upload/f_png,e_background_removal/"
        );
        setImagenResultado(urlSinFondo);
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar imagen");
    } finally {
      setProcesando(false);
    }
  };

  // NUEVA LÓGICA DE DESCARGA COMPATIBLE CON WEBVIEW
  const descargarImagen = () => {
    if (!imagenResultado) return;
    
    const enlace = document.createElement("a");
    enlace.href = imagenResultado;
    enlace.download = "FondoOff.png";
    enlace.target = "_blank"; // Ayuda a que el WebView lo gestione como nueva ventana/descarga
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  return (
    <div className="app">
      <h1>FondoOff</h1>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={inputFile}
        onChange={subirImagen}
      />

      {!procesando && !imagenResultado && (
        <button className="boton" onClick={seleccionarImagen}>
          📷 Subir imagen
        </button>
      )}

      {procesando && (
        <div className="contenedor-carga">
          <div className="spinner"></div>
          <p className="texto-carga">Estamos quitando el fondo...</p>
        </div>
      )}

      {imagenResultado && !procesando && (
        <div className="resultado">
          <img src={imagenResultado} className="imagen" alt="Sin fondo" />
          
          <div className="acciones">
            <button className="boton" onClick={descargarImagen}>
              ⬇ Descargar PNG
            </button>
            <button 
              className="boton" 
              onClick={() => setImagenResultado(null)}
              style={{ backgroundColor: "#ff7675" }}
            >
              🔄 Otra foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;