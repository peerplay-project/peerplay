import os from 'os'
import { execFile } from 'child_process'
export const lan_play_version = "0.2.3"
let started = false
let child_process = undefined
const isProd = process.env.NODE_ENV === 'production';
let filepath = ""
let executablePaths = {}
export function lan_play_start(server_ip) {
    if (child_process === undefined){
        if (isProd) {
            filepath = `${process.resourcesPath}`
            executablePaths = {
                'win32': `${filepath}\\app.asar\\resources\\peerplay_tools\\lan_play\\software\\windows\\lan-play.exe`,
                'linux': `chmod +x ${filepath}/app.asar/resources/peerplay_tools/lan_play/software/linux/lan-play && ./${filepath}/app.asar/resources/peerplay_tools/lan_play/software/linux/lan-play`,
                'darwin': `chmod +x ${filepath}/app.asar/resources/peerplay_tools/lan_play/software/macos/lan-play && ./${filepath}/app.asar/resources/peerplay_tools/lan_play/software/macos/lan-play`
            }
        } else {
            filepath = `${process.resourcesPath.slice(0, -37)}`
            executablePaths = {
                'win32': `${filepath}\\resources\\peerplay_tools\\lan_play\\software\\windows\\lan-play.exe`,
                'linux': `chmod +x ${filepath}/resources/peerplay_tools/lan_play/software/linux/lan-play && ./${filepath}/resources/peerplay_tools/lan_play/software/linux/lan-play`,
                'darwin': `chmod +x ${filepath}/resources/peerplay_tools/lan_play/software/macos/lan-play && ./${filepath}/resources/peerplay_tools/lan_play/software/macos/lan-play`
            }
        }
    
        // Obtenir le chemin absolu de l'exécutable en fonction du système hôte
        const executablePath = executablePaths[os.platform()];
        // Lancer l'exécutable avec les arguments nécessaires
        child_process = execFile(`${executablePath}`, ['--relay-server-addr', server_ip.split(' ')[0].replace(/[&<>;'"]/g, "")])
        child_process.on('exit', () => {
            child_process = undefined;
            started = false;
        });

        child_process.on('error', () => {
            child_process = undefined;
            started = false;
        });
        started = true
        if (child_process.pid !== undefined){
            return 'SUCCESS'
        }
        else
        {
            return executablePath
        }
    }
}
export function lan_play_stop() {
    if (child_process !== undefined){
        child_process.kill()
    }
}
export function lan_play_restart(server_ip) {

}
export function lan_play_status() {
    return started
}