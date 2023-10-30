import {
  app,
  Menu,
  Tray,
  Notification,
  nativeImage,
  BrowserWindow,
  dialog,
} from "electron";
import { autoUpdater } from "electron-updater";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import path from "path";
import Store from "electron-store";

// ELECTRON AUTO UPDATE SETTINGS (DON'T TOUCH IT, IS MANAGED BY GITHUB ACTIONS)
//
const enableAutoUpdate = false; // Enable/Disable Auto Updater
// ----------------------------------------------------------------------------
interface Data {
  support_pre_releases: Boolean;
}
const store = new Store<Data>({
  name: "auto_updater_config",
});
const valeursParDefaut: Data = {
  support_pre_releases: false,
};

const isProd = process.env.NODE_ENV === "production";

// AUTO UPDATER SCRIPT (DON'T TOUCH IT IF YOU DON'T KNOW WHAT YOU DOING)
if (enableAutoUpdate) {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'peerplay_project',
      repo: 'peerplay',
      private: false,
    });
  
    autoUpdater.on('update-available', async (info) => {
        if (info && info.version && info.version.includes('-pre')) {
            const { response } = await dialog.showMessageBox({
                type: 'question',
                message: `Mise à jour disponible : ${info.version}`,
                detail: "Une mise à jour prerelease de peerplay est disponible. Voulez-vous la télécharger et l\'installer?\n Attention Vous devrez installer manuellement la mise a jour vers la version stable quand elle sortira",
                buttons: ['Oui', 'Non']
              });
          
              if (response === 0) {
                // Télécharger et installer la mise à jour
                autoUpdater.downloadUpdate();
              }
              else
              {
                return;
              }
        }
        else {
            const { response } = await dialog.showMessageBox({
                type: 'question',
                message: `Mise à jour disponible : ${info.version}`,
                detail: 'Une mise à jour de peerplay est disponible. Voulez-vous la télécharger et l\'installer?',
                buttons: ['Oui', 'Non']
              });
          
              if (response === 0) {
                // Télécharger et installer la mise à jour
                autoUpdater.downloadUpdate();
              }
        }
      });
  
    autoUpdater.on('update-downloaded', () => {
      // Code à exécuter lorsque la mise à jour est téléchargée et prête à être installée
      autoUpdater.quitAndInstall();
    });
  
    app.on('ready', () => {
      // Vérifiez les mises à jour au démarrage de l'application, uniquement dans l'environnement de production avec releases
      autoUpdater.checkForUpdates();
    });
  }

let filepath = "";
if (isProd) {
  serve({ directory: "app" });
  filepath = path.join(app.getAppPath(), "resources", "icon.ico");
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
  filepath = path.join(
    process.resourcesPath,
    "..",
    "..",
    "..",
    "..",
    "resources",
    "icon.ico"
  );
  console.log(filepath);
}

let mainWindow: BrowserWindow = null;
let tray: Tray = null;

async function createMainWindow() {
  mainWindow = createWindow("main", {
    width: 1150,
    height: 700,
    resizable: false,
    webPreferences: {
      devTools: !isProd,
    },
  });
  if (isProd) {
    mainWindow.removeMenu();
  }
  await mainWindow.loadURL(
    isProd ? "app://./home.html" : `http://localhost:${process.argv[2]}/home`
  );
  mainWindow.on("close", (event) => {
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
      label: "Open Peerplay UI",
      click: () => {
        if (mainWindow.isVisible()) {
          new Notification({
            icon: nativeImage.createFromPath(filepath),
            title: "Peerplay UI Already Opened",
            body: "Peerplay UI is Already Opened cannot open other BrowserWindow",
          }).show();
        } else {
          mainWindow.show();
        }
      },
    },
    {
      label: "Quit",
      click: () => {
        app.exit();
      },
    },
  ]);
  tray.setToolTip("Peerplay");
  tray.setContextMenu(contextMenu);
}

app.on("ready", async () => {
  await createTray();
  await createMainWindow();
});

app.on("window-all-closed", () => {});
