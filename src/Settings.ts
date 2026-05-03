class ConfigHandler {
    configBtn: HTMLButtonElement;
    closeConfigBtn: HTMLButtonElement;
    configMenu: HTMLDivElement;

    constructor() {
        this.configBtn = BUTTONS.configBtn!;
        this.closeConfigBtn = BUTTONS.closeConfigBtn!;
        this.configMenu = BUTTONS.configMenu!;

        this.init();
    }

    init() {
        this.configBtn.addEventListener("click", () => {
            this.toggleMenu();
        });

        this.closeConfigBtn.addEventListener("click", () => {
            this.closeMenu();
        });
    }

    toggleMenu() {
        this.configMenu.classList.toggle("open");
    }

    closeMenu() {
        this.configMenu.classList.remove("open");
    }
}

new ConfigHandler();

type Theme = {
    [key: string]: string;
};

interface ThemeColors {
    '--text': string;
    '--text-2': string;
    '--text5f': string;
    '--bg': string;
    '--bg-field': string;
    '--bg-hover': string;
    '--bg-hoveraa': string;
    '--bg-click': string;
    '--bg-selected': string;
    '--link': string;
}

interface ActualTheme {
    themeColors: ThemeColors;
    buttonId: string;
}

let actualTheme: ActualTheme | null = null;

document.getElementById('theme-a-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#f2f2f2',
        '--text-2': '#696969',
        '--text5f': '#f2f2f25f',
        '--bg': '#0f0f0f',
        '--bg-field': '#272727',
        '--bg-hover': '#464646',
        '--bg-hoveraa': '#464646aa',
        '--bg-click': '#787878',
        '--bg-selected': '#a39e9b',
        '--link': '#0465ec',
    };
    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-a-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-a-btn'};
});

document.getElementById('theme-b-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#0f0f0f',
        '--text-2': '#969696',
        '--text5f': '#0f0f0f5f',
        '--bg': '#fafafa',
        '--bg-field': '#d8d8d8',
        '--bg-hover': '#b9b9b9',
        '--bg-hoveraa': '#b9b9b9aa',
        '--bg-click': '#878787',
        '--bg-selected': '#5c6164',
        '--link': '#0465ec',
    };

    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-b-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-b-btn'};
});

document.getElementById('theme-c-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#eeeeee',
        '--text-2': '#495a65',
        '--text5f': '#eeeeee5f',
        '--bg': '#303841',
        '--bg-field': '#3a4750',
        '--bg-hover': '#4c5a63',
        '--bg-hoveraa': '#4c5a63aa',
        '--bg-click': '#5a6a74',
        '--bg-selected': '#72848f',
        '--link': '#d72323',
    };
    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-c-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-c-btn'};
});

document.getElementById('theme-d-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#8e9fb7',
        '--text-2': '#3a4350',
        '--text5f': '#8e9fb75f',
        '--bg': '#11161d',
        '--bg-field': '#0c0e11',
        '--bg-hover': '#151c27',
        '--bg-hoveraa': '#151c27aa',
        '--bg-click': '#243348',
        '--bg-selected': '#415674',
        '--link': '#ec7c04',
    }
    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-d-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-d-btn'};
});

document.getElementById('theme-e-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#7b5635',
        '--text-2': '#d9b18f',
        '--text5f': '#7b56355f',
        '--bg': '#ffefd5',
        '--bg-field': "#ffdab9",
        '--bg-hover': '#e5ba95',
        '--bg-hoveraa': '#e5ba95aa',
        '--bg-click': '#ce9e75',
        '--bg-selected': '#c38957',
        '--link': '#ee971b',
    };
    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-e-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-e-btn'};
});

document.getElementById('theme-f-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#f6ecf5',
        '--text-2': '#eaabe1',
        '--text5f': '#f6ecf55f',
        '--bg': '#d384c8',
        '--bg-field': "#c36fb7",
        '--bg-hover': '#99498d',
        '--bg-hoveraa': '#99498daa',
        '--bg-click': '#7c3071',
        '--bg-selected': '#65245b',
        '--link': '#9737e1',
    };
    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-f-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-f-btn'};
});

document.getElementById('theme-g-btn')?.addEventListener('click', () => {
    let themeColors = {
        '--text': '#dc4e64',
        '--text-2': '#722a3e',
        '--text5f': '#dc4e645f',
        '--bg': '#311d3f',
        '--bg-field': "#522546",
        '--bg-hover': '#6a2e4d',
        '--bg-hoveraa': '#6a2e4daa',
        '--bg-click': '#7a3257',
        '--bg-selected': '#8b3260',
        '--link': '#821a6f',
    }
    setTheme(themeColors);
    setActiveButton(document.getElementById('theme-g-btn') as HTMLButtonElement);
    actualTheme = {themeColors: themeColors, buttonId: 'theme-g-btn'};
});

function setTheme(theme: Theme): void {
    Object.keys(theme).forEach((variable: string) => {
        document.documentElement.style.setProperty(variable, theme[variable]);
    });
}

function setActiveButton(activeButton: HTMLButtonElement): void {
    const buttons = document.querySelectorAll('#theme-container > button');
    buttons.forEach((button: Element) => {
        button.classList.remove('mode-active');
    });
    activeButton.classList.add('mode-active');
}

const autoGrabCb = document.getElementById('autograb-cb');

if (autoGrabCb) {

  let isChecked = localStorage.getItem('autograbChecked') === 'true';
  autoGrabCb.classList.toggle('active', isChecked);
  document.getElementById('exact-time-btn')!.style.display = isChecked ? 'none' : 'inline';

  let intervalId: number | null = null;

  const startLoop = () => {
    if (intervalId === null) {
      intervalId = window.setInterval(() => {
        const fps = getFramerate();
        browserAction.getVideoSeconds().then((response) => {
          const time = Math.floor(response * fps) / fps;
          ELEMENTS.videoTimeInput.value = time.toString();
        });
      }, 16); //ms
    }
  };

  const stopLoop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  if (isChecked) startLoop();

  autoGrabCb.addEventListener('click', () => {
    isChecked = !isChecked;
    autoGrabCb.classList.toggle('active', isChecked);
    document.getElementById('exact-time-btn')!.style.display = isChecked ? 'none' : 'inline';

    localStorage.setItem('autograbChecked', isChecked.toString());

    if (isChecked) startLoop();
    else stopLoop();
  });
}
