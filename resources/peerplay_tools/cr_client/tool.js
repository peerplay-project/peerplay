import * as fs from "fs";

export const peerplay_cr_client_version = "1.0.0"
import { console_db_patched_app, console_db_legacy_app } from "./console_db";
import { execFile } from "child_process";
import os from 'os'
let started = false
let child_process = []
const isProd = process.env.NODE_ENV === 'production';
const use_patched_mode = false // TODO: Pass this parameter at true when lan-play release --ip-pool argument
export function peerplay_cr_client_start(server_ip) {
    if (child_process.length === 0) {
        let filepath = ""
        let executablePath = ""
        if (use_patched_mode === true) {
            let patched_executablePaths = {}
            if (isProd) {
                filepath = `${process.resourcesPath}`
                patched_executablePaths = {
                    'win32': `${filepath}\\app.asar\\resources\\peerplay_tools\\cr_client\\software\\windows\\peerplay-cr-client.exe`,
                    'linux': `${filepath}/app.asar/resources/peerplay_tools/cr_client/software/linux/peerplay-cr-client`,
                    'darwin': `${filepath}/app.asar/resources/peerplay_tools/cr_client/software/macos/peerplay-cr-client`
                }
            } else {
                filepath = `${process.resourcesPath.slice(0, -37)}`
                patched_executablePaths = {
                    'win32': `${filepath}\\resources\\peerplay_tools\\cr_client\\software\\windows\\peerplay-cr-client.exe`,
                    'linux': `${filepath}/resources/peerplay_tools/cr_client/software/linux/peerplay-cr-client`,
                    'darwin': `${filepath}/resources/peerplay_tools/cr_client/software/macos/peerplay-cr-client`
                }
            }
            // Obtenir le chemin absolu de l'exécutable en fonction du système hôte
            executablePath = patched_executablePaths[os.platform()];
            fs.chmodSync(executablePath, 0o755)
            // Lancer l'exécutable avec les arguments nécessaires
            let count = 0
            console_db_patched_app.forEach(console => {
                child_process.push(execFile(`${executablePath}`, ['--relay-server-addr', server_ip.split(' ')[0].replace(/[&<>;'"]/g, ""), `--ip-pool`, console]));
                child_process[count].on('exit', () => {
                    child_process = undefined;
                    started = false;
                    child_process = []
                });

                child_process[count].on('error', () => {
                    child_process = undefined;
                    started = false;
                    child_process = []
                });
                count++
            })
        }
        else {
            if (isProd) {
                switch (os.platform()) {
                    case 'win32':
                        filepath = `${process.resourcesPath}\\app.asar`
                        break;
                    case 'darwin':
                        filepath = `${process.resourcesPath}/app.asar`
                        break;
                    case 'linux':
                        filepath = `${process.resourcesPath}/app.asar`
                        break;
                }
            }
            else {
                switch (os.platform()) {
                    case 'win32':
                        filepath = `${process.resourcesPath.slice(0, -37)}`
                        break;
                    case 'darwin':
                        filepath = `${process.resourcesPath.slice(0, -37)}`
                        break;
                    case 'linux':
                        filepath = `${process.resourcesPath.slice(0, -37)}`
                        break;
                }
            }
            console_db_legacy_app.forEach(executable => {
                let executablePath = ""
                let count = 0
                switch (os.platform()) {
                    case 'win32':
                        executablePath = `${filepath}\\${executable.win32}`
                        console.log(executablePath)
                        child_process.push(execFile(executablePath, ['--relay-server-addr', server_ip.split(' ')[0].replace(/[&<>;'"]/g, "")]));
                        break;
                    case 'linux':
                        executablePath = `${filepath}/${executable.linux}`
                        fs.chmodSync(executablePath, 0o755)
                        child_process.push(execFile(executablePath, ['--relay-server-addr', server_ip.split(' ')[0].replace(/[&<>;'"]/g, "")]));
                        break;
                    case 'darwin':
                        executablePath = `${filepath}/${executable.darwin}`
                        fs.chmodSync(executablePath, 0o755)
                        child_process.push(execFile(executablePath, ['--relay-server-addr', server_ip.split(' ')[0].replace(/[&<>;'"]/g, "")]));
                        break;
                }
                child_process[count].on('exit', () => {
                    child_process = undefined;
                    started = false;
                    child_process = []
                });

                child_process[count].on('error', () => {
                    child_process = undefined;
                    started = false;
                    child_process = []
                });
                count++
            })
        }
        if (child_process[0].pid !== undefined) {
            started = true
            return 'SUCCESS'
        }
        else {
            return executablePath
        }
    }
}
export function peerplay_cr_client_stop() {
    if (child_process.length !== 0) {
        child_process.forEach(child => {
            child.kill()
        });
    }
}
export function peerplay_cr_client_status() {
    return started
}