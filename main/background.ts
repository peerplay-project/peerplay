import { app, Menu, Tray, Notification, nativeImage, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
let filepath = ""
if (isProd) {
    serve({ directory: 'app' });
    filepath = `${app.getAppPath()}\\resources\\icon.ico`
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
    filepath = path.join(process.resourcesPath, '..', '..','..', '..', 'resources','icon.ico');
    console.log(filepath)
}

let mainWindow: BrowserWindow = null;
let tray: Tray = null;

async function createMainWindow() {
    mainWindow = createWindow('main', {
        width: 1000,
        height: 700,
        resizable: false,
        webPreferences: {
            devTools: !isProd
        }
    });
    if (isProd) {
        mainWindow.removeMenu();
    }
    await mainWindow.loadURL(isProd ? 'app://./home.html' : `http://localhost:${process.argv[2]}/home`);
    mainWindow.on('close', (event) => {
        event.preventDefault();
        mainWindow.hide();
        new Notification({
            icon: nativeImage.createFromPath(filepath),
            title: "Peerplay Running on Background",
            body: "Peerplay Running on Background for keep services running",
        }).show();
    });    
}

async function createTray() {
    tray = new Tray(nativeImage.createFromPath(filepath));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Peerplay UI',
            click: () => {
                if (mainWindow.isVisible()) {
                    new Notification({
                        icon: nativeImage.createFromPath(filepath),
                        title: "Peerplay UI Already Opened",
                        body: "Peerplay UI is Already Opened cannot open other BrowserWindow",
                    }).show();
                }
                else {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.exit();
            }
        }
    ]);
    tray.setToolTip('Peerplay');
    tray.setContextMenu(contextMenu);
}

app.on('ready', async () => {
    await createTray();
    await createMainWindow();
});

app.on('window-all-closed', () => {});