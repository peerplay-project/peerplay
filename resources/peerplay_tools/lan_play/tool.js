import os from 'os'
import path from 'path'
import fs from 'fs'
import { execFile } from 'child_process'
export const lan_play_version = "0.2.3"
let started = false
let child_process = undefined
const isProd = process.env.NODE_ENV === 'production';
let filepath = ""
let platform = ""
let executablePath = ""
export function lan_play_start(server_ip) {
    if (child_process === undefined){
        switch (os.platform()) {
            case "win32":
                platform = "windows"
                break;
            case "linux":
                platform = "linux";
                break;
            case "darwin":
                platform = "macos";
                break;
        }
        if (isProd){
            filepath = path.join(process.resourcesPath, "app.asar");
        }
        else
        {
            filepath = path.resolve(process.resourcesPath,"../../../../");
        }
        let executableName = "lan-play";
        executablePath = path.join(
            filepath,
            "resources",
            "peerplay_tools",
            "lan_play",
            "software",
            platform,
            executableName
        );
        if (platform === "windows"){
            executablePath + ".exe"
        }
        else
        {
            fs.chmodSync(executablePath, 0o755);
        }
        console.log(executablePath)
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