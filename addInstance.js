const addBtn = document.querySelector("#add-btn");

addBtn.addEventListener("click", () => {
    addInstance();
});

function addInstance() {
    // Crear los elementos para la nueva instancia
    var container = document.createElement('div');
    var selectButton = document.createElement('input');
    var timeInput = document.createElement('input');
    var removeButton = document.createElement('button');
    var resetButton = document.createElement('button');

    // Configurar los atributos y contenido de los elementos
    container.classList.add('instance');

    selectButton.type = 'radio';
    selectButton.name = 'select-instance';
    selectButton.checked = true;
    
    resetButton.textContent = '↻';
    removeButton.textContent = '–';

    timeInput.type = 'text';
    timeInput.id = 'time-instance-text';
    timeInput.placeholder = '00h 00m 00s 000ms';
    timeInput.disabled = true;

    removeButton.addEventListener("click", () => {
        container.remove();
    });

    resetButton.addEventListener("click", () => {
        timeInput.value = '00h 00m 00s 000ms';
    });

    // Agregar los elementos al contenedor principal
    container.appendChild(selectButton);
    container.appendChild(timeInput);
    container.appendChild(resetButton);
    container.appendChild(removeButton);

    // Obtener el contenedor de instancias y agregar la nueva instancia
    var instancesContainer = document.getElementById('instances-container');
    instancesContainer.appendChild(container);
}
