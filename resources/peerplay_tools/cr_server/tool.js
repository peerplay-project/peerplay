import os from 'os'
import { fork } from 'child_process'
export const peerplay_cr_server_version = "1.0.0"
const db_password = "t*vaf4j&69QgZ7!Mab2smA&ZNr^gkM4LehnxHn5mqa49%qz6DQ_8#+d@DBmgQ&c6U=YtRn2hDGxSCZ#&%mNs-kMQV-TpG+WLP4DT7A9TEYSmwmjv7kPZUJW?H!x848j!"
const db_list = 'peerplay-rootdb-alpha.freeboxos.fr:32771'
let started = false
let child_process = undefined
const isProd = process.env.NODE_ENV === 'production';
let filepath = ""
let executablePaths = {}
let last_boot = 0
export function peerplay_cr_server_start(uuid, minimal_port_range, domain_name, open_external_server, external_server_port) {
    if (child_process === undefined) {
        let environment= "development"
        if (isProd) {
            environment = "production"
            filepath = `${process.resourcesPath}`
            executablePaths = {
                'win32': `${filepath}\\app.asar\\resources\\peerplay_tools\\cr_server\\software\\peerplay_cr_server.js`,
                'linux': `${filepath}/app.asar/resources/peerplay_tools/cr_server/software/peerplay_cr_server.js`,
                'darwin': `${filepath}/app.asar/resources/peerplay_tools/cr_server/software/peerplay_cr_server.js`
            }
        } else {
            environment = "development"
            filepath = `${process.resourcesPath.slice(0, -37)}`
            executablePaths = {
                'win32': `${filepath}\\resources\\peerplay_tools\\cr_server\\software\\peerplay_cr_server.js`,
                'linux': `${filepath}/resources/peerplay_tools/cr_server/software/peerplay_cr_server.js`,
                'darwin': `${filepath}/resources/peerplay_tools/cr_server/software/peerplay_cr_server.js`
            }
        }

        // Obtenir le chemin absolu de l'exécutable en fonction du système hôte
        const executablePath = executablePaths[os.platform()];
        const options = {
            env: {
                ...process.env,
                NODE_ENV: environment
            }
        };
        let args = ['--uuid', uuid, '--jwt_secret', uuid, '--minimal_port_range', minimal_port_range,]
        if (open_external_server) { args.push('--open_external_server', open_external_server, '--external_server_port', external_server_port) }
        if (domain_name !== "") { args.push('--domain_name', domain_name) }
        if (db_list !== "" && environment === "production") { args.push('--custom_database_list', db_list) } else { args.push('--custom_database_list', "")}
        if (db_password !== "") { args.push('--database_password', db_password) }
        child_process = fork(`${executablePath}`,args, options)
        child_process.on('exit', () => {
            child_process = undefined;
            started = false;
            last_boot = 0
        });

        child_process.on('error', () => {
            child_process = undefined;
            started = false;
            last_boot = 0
        });
        let status = "";

        if (child_process.pid !== undefined) {
            started = true;
            last_boot = Date.now()
            status = 'SUCCESS';
        } else {
            status = "Peerplay CR Server Throw a Fatal Error: please start Peerplay on Diagnostic mode";
        }
        return status
    }
}
export function peerplay_cr_server_stop() {
    if (child_process !== undefined) {
        child_process.kill()
    }
}

export function peerplay_cr_server_status() {
    let running = false
    if (Date.now() - last_boot >= 10000){
        running = true
    }
    else{
        running = false
    }
return {
    started: started,
    running: running
}
}
