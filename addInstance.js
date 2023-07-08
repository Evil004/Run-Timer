function addInstance() {

    // Crear los elementos para la nueva instancia
    var container = document.createElement('div');
    var selectButton = document.createElement('button');
    var timeInput = document.createElement('input');
    var removeButton = document.createElement('button');
    var resetButton = document.createElement('button');
  
    // Configurar los atributos y contenido de los elementos
    
    container.classList.add('instances');
    selectButton.textContent = '→';
    resetButton.textContent = '↻';
    removeButton.textContent = '–';
    timeInput.type = 'text';
    timeInput.placeholder = '00h 00m 00s 000ms';
    timeInput.disabled = true;

    removeButton.onclick = function() {
        container.remove();
    };

    resetButton.onclick = function() {
        timeInput.value = '00h 00m 00s 000ms';
    };

    // Agregar los elementos al container principal
    container.appendChild(selectButton);
    container.appendChild(timeInput);
    container.appendChild(resetButton);
    container.appendChild(removeButton);

    // Obtener el container de instancias y agregar la nueva instancia
    var instancesContainer = document.getElementById('instances-container');
    instancesContainer.appendChild(container);
  }


var resetButton = document.getElementById('reset-btn');
var timeText = document.getElementById('time-instance-text');

resetButton.onclick = function() {
  timeText.value = '00h 00m 00s 000ms';
};


  // Soy buenísima 😎 (Con voz de Vegeta de Dragon Ball Latino) Óscar te voy a quitar el trabajo putito