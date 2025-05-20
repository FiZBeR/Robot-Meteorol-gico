// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS61q81Edz6taT1OCVShMBbVSmCZRCcIs",
  authDomain: "robot-meteorologico.firebaseapp.com",
  databaseURL: "https://robot-meteorologico-default-rtdb.firebaseio.com",
  projectId: "robot-meteorologico",
  storageBucket: "robot-meteorologico.firebasestorage.app",
  messagingSenderId: "314729113500",
  appId: "1:314729113500:web:1e55e6fabf547edf194a59"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencias a elementos del DOM
const piranoValue = document.getElementById('piranoValue');
const messageContainer = document.getElementById('messageContainer');
const btnSpeak = document.getElementById('btnSpeak');
const loadingIndicator = document.getElementById('loadingIndicator');
const robotMouth = document.querySelector('.mouth-animation');

// Variable para almacenar el último valor recibido
let lastValue = null;
let isPlaying = false;

// Conectar a Firebase para escuchar cambios en los datos del piranómetro
const piranoRef = database.ref('piranometro/valor');
piranoRef.on('value', (snapshot) => {
    const value = snapshot.val();
    if (value !== null && value !== lastValue) {
        lastValue = value;
        updateUI(value);
    }
});

// Función para actualizar la UI con el nuevo valor
function updateUI(value) {
    // Actualizar las visualizaciones de valores
    piranoValue.textContent = value.toFixed(2);
    
    // Generar mensaje basado en el rango del valor
    const message = generateMessage(value);
    messageContainer.innerHTML = `<p>${message}</p>`;
    
    // Habilitar el botón de hablar
    btnSpeak.disabled = false;
}

// Función para generar mensajes según el rango del valor del piranómetro
function generateMessage(value) {
    if (value < 100) {
        return "La radiación solar es muy baja en este momento. Esto sugiere un cielo muy nublado o que estamos cerca del amanecer o atardecer. En estas condiciones, la producción de energía solar sería mínima y las plantas reciben poca luz para la fotosíntesis.";
    } else if (value < 300) {
        return "La radiación solar es baja. Probablemente estamos ante un día nublado o con mucha bruma. Estas condiciones son típicas de días con alta humedad o contaminación atmosférica que filtra los rayos solares.";
    } else if (value < 600) {
        return "La radiación solar es moderada. El cielo podría estar parcialmente nublado, con algunas nubes dispersas que ocasionalmente bloquean el sol. Es un nivel adecuado para actividades al aire libre sin riesgo elevado de quemaduras solares.";
    } else if (value < 900) {
        return "La radiación solar es alta. Estamos ante un día mayormente soleado con pocas nubes. Este nivel de radiación es excelente para sistemas fotovoltaicos y calentadores solares. Recomendaría usar protección solar si se planea estar al aire libre.";
    } else {
        return "La radiación solar es muy alta. El cielo está completamente despejado y estamos probablemente cerca del mediodía. Estas condiciones son ideales para la generación de energía solar, pero representan un riesgo de quemaduras solares. Es fundamental usar protección solar adecuada y evitar exposición prolongada al sol.";
    }
}

// Función para convertir texto a voz utilizando la API Web Speech (gratuita)
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9; // un poco más lento para mayor claridad
        
        // Evento cuando comienza a hablar
        utterance.onstart = () => {
            isPlaying = true;
            robotMouth.classList.add('speaking');
            btnSpeak.disabled = true;
            loadingIndicator.style.display = 'none';
        };
        
        // Evento cuando termina de hablar
        utterance.onend = () => {
            isPlaying = false;
            robotMouth.classList.remove('speaking');
            btnSpeak.disabled = false;
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tu navegador no soporta la API de síntesis de voz.");
        loadingIndicator.style.display = 'none';
        btnSpeak.disabled = false;
    }
}

// Configurar el evento de clic para el botón de hablar
btnSpeak.addEventListener('click', () => {
    if (!isPlaying && lastValue !== null) {
        loadingIndicator.style.display = 'inline-block';
        btnSpeak.disabled = true;
        
        // Obtener el texto del mensaje
        const message = messageContainer.textContent;
        
        // Pequeño retraso para dar efecto visual
        setTimeout(() => {
            speakText(message);
        }, 500);
    }
});

// Simulación para pruebas (comentar esto cuando se use con datos reales)
function simulateData() {
    const randomValue = Math.random() * 1200;
    database.ref('piranometro/valor').set(randomValue);
    setTimeout(simulateData, 10000);
}

//Descomenta esta línea para activar la simulación
 setTimeout(simulateData, 2000);