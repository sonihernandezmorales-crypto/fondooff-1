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
        // CORRECCIÓN: El orden f_png,e_background_removal es más estable para la API
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

  const descargarImagen = async () => {
    try {
      const respuesta = await fetch(imagenResultado);
      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "FondoOff.png";
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("No se pudo descargar la imagen");
    }
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

      {!imagenResultado && !procesando && (
        <button className="boton" onClick={seleccionarImagen}>
          📷 Subir imagen
        </button>
      )}

      {procesando && <p>⏳ Quitando fondo...</p>}

      {imagenResultado && (
        <div className="resultado">
          <img src={imagenResultado} className="imagen" alt="Sin fondo" />
          
          <div className="acciones">
            <button className="boton" onClick={descargarImagen}>
              ⬇ Descargar PNG
            </button>
            <button 
              className="boton" 
              onClick={() => setImagenResultado(null)}
              style={{ backgroundColor: "#ff4d4d" }}
            >
              🔄 Subir otra foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;