import React from 'react';
import Typography from '@mui/material/Typography';
import { Button, Divider, Grid, Stack, styled } from '@mui/material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
const { shell } = require('electron')
import os from 'node:os';
const Root = styled('div')(({ theme }) => {
    return {
        textAlign: 'center',
        paddingTop: theme.spacing(4),
    };
})
let toolInstallDialogContent = {
    title: "",
    description: "",
    link_name:"",
    link: ""
}

function Home() {
const Install_Drivers = () =>{
    switch (os.platform()) {
        case 'win32':
            toolInstallDialogContent.title = "Libpcap Installation Process (Windows)";
            toolInstallDialogContent.description = "For install libpcap on your computer you need to install NPCAP with winpcap compatibility mode at https://npcap.com/#download";
            toolInstallDialogContent.link_name = "Download NPCAP";
            toolInstallDialogContent.link = "https://npcap.com/#download";
            handleClickToolInstallDialog();
            break;
        case 'linux':
            toolInstallDialogContent.title = "Libpcap Installation Process (GNU / Linux)";
            toolInstallDialogContent.description = "For install libpcap on your computer you need to use your package manager (apt, pacman, yum, etc...) and install libpcap0.8 and libuv1";
            toolInstallDialogContent.link_name = "";
            toolInstallDialogContent.link = "";
            handleClickToolInstallDialog();
            break;
        case 'darwin':
            toolInstallDialogContent.title = "Libpcap Installation Process (MacOS)";
            toolInstallDialogContent.description = "For install libpcap on your computer you need to install homebrew and use it to install libpcap and libuv with this command : brew install libpcap libuv";
            toolInstallDialogContent.link_name = "Download Homebrew";
            toolInstallDialogContent.link = "https://brew.sh/";
            handleClickToolInstallDialog();
        }
}
const  Install_External_Tool = (tool_codename) => {
    switch (tool_codename) {
        case 'NO_IP_DUC':
            toolInstallDialogContent.title = "NO IP DUC Installation Process";
            toolInstallDialogContent.description = "For use DUC you need to have an account on NO IP and create a domain name, after that you need to download and install the DUC client on your computer and configure it";
            toolInstallDialogContent.link_name = "Download NO IP DUC Client";
            toolInstallDialogContent.link = "https://www.noip.com/download";
            handleClickToolInstallDialog();
            break;
        default:
            console.log('Tool not found');
            break;
    }
}

const [openToolInstallDialog, setOpenToolInstallDialog] = React.useState(false);
const handleCloseToolInstallDialog = () => setOpenToolInstallDialog(false);
const handleClickToolInstallDialog = () => setOpenToolInstallDialog(true);
    return (
        <React.Fragment>
            <Dialog open={openToolInstallDialog} onClose={handleCloseToolInstallDialog}>
                <DialogTitle>{toolInstallDialogContent.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{toolInstallDialogContent.description}</DialogContentText>
                </DialogContent>
                    {toolInstallDialogContent.link !== "" ? <Button color="primary" onClick={() => {shell.openExternal(toolInstallDialogContent.link)}}>{toolInstallDialogContent.link_name}</Button> : null}
                <DialogActions>
                    <Button color="primary" onClick={handleCloseToolInstallDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container>
                <Grid item md={8}>
                <Typography variant="subtitle1" gutterBottom>Warning : All Installations is Manual, buttons just open realated download links</Typography>
                <Stack direction="column" spacing={1.5}>
                    <Stack direction="column" spacing={0.1}>
                        <Button fullWidth variant="contained" color="primary" onClick={Install_Drivers}>
                            Install Drivers
                        </Button>
                        <Typography variant="subtitle1" gutterBottom>Install all necessary Drivers (NPCAP for exemple)</Typography>
                    </Stack>
                    <Stack direction="column" spacing={0.1}>
                        <Button fullWidth variant="contained" color="primary" onClick={() => Install_External_Tool("NO_IP_DUC")}>
                            Install Optional Feature : NO-IP DUC
                        </Button>
                        <Typography variant="subtitle1" gutterBottom>Use NO-IP DUC to link a NO-IP domain name to your public ip in real time, NO-IP is a free external service that will allow you to replace your Public IP with a domain name in the database</Typography>
                    </Stack>
                </Stack>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="h5" gutterBottom>Coming Soon Features</Typography>
                    <Stack spacing={1}>
                        <Typography variant="subtitle1" gutterBottom>- Autostart App Components</Typography>
                    </Stack>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default Home;
