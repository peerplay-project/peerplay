import * as fs from "fs";
import { execFile } from "child_process";
import path from "path";
import os from "os";

export const peerplay_cr_client_version = "1.0.0";

import { console_db_patched_app, console_db_legacy_app } from "./console_db";

let started = false;
let child_processes = [];

const isProd = process.env.NODE_ENV === "production";
const use_patched_mode = false; // TODO: Pass this parameter as true when lan-play release --ip-pool argument

export function peerplay_cr_client_start(server_ip) {
    if (child_processes.length === 0) {
        let filepath = "";
        let executablePath = "";
        let platform = os.platform();
        let executableName = "peerplay-cr-client";
        switch (platform) {
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
        if (use_patched_mode) {
            executablePath = path.join(
                filepath,
                "resources",
                "peerplay_tools",
                "cr_client",
                "software",
                platform,
                executableName
            );
            fs.chmodSync(executablePath, 0o755);
            let count = 0;
            console_db_patched_app.forEach((console) => {
                child_processes.push(
                    execFile(executablePath, [
                        "--relay-server-addr",
                        server_ip.split(" ")[0].replace(/[&<>;'"]/g, ""),
                        "--ip-pool",
                        console,
                    ])
                );

                child_processes[count].on("exit", () => {
                    child_processes = [];
                    started = false;
                });

                child_processes[count].on("error", () => {
                    child_processes = [];
                    started = false;
                });
                count++;
            });
        } else {
            executablePath = path.join(
                filepath,
                "resources",
                "peerplay_tools",
                "cr_client",
                "software",
                platform,
                "legacy"
            );
            console_db_legacy_app.forEach((console_app) => {
                let count = 0;
                let legacy_executablePath = "";
                if (platform === "windows") {
                    legacy_executablePath = path.join(executablePath, console_app) + ".exe";
                }
                else {
                    legacy_executablePath = path.join(executablePath, console_app);
                }
                fs.chmodSync(legacy_executablePath, 0o755);
                child_processes.push(
                    execFile(legacy_executablePath, [
                        "--relay-server-addr",
                        server_ip.split(" ")[0].replace(/[&<>;'"]/g, ""),
                    ])
                );

                child_processes[count].on("exit", () => {
                    child_processes = [];
                    started = false;
                });

                child_processes[count].on("error", () => {
                    child_processes = [];
                    started = false;
                });
                count++;
            })
        }

        if (child_processes[0].pid !== undefined) {
            started = true;
            return "SUCCESS";
        } else {
            return executablePath;
        }
    }
}

export function peerplay_cr_client_stop() {
    if (child_processes.length !== 0) {
        child_processes.forEach(child => {
            child.kill()
        });
    }
}

export function peerplay_cr_client_status() {
return started;
}
