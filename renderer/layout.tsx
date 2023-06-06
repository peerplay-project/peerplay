import React, { useState, useEffect } from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import LanguageIcon from '@mui/icons-material/Language';
import DnsIcon from '@mui/icons-material/Dns';
import LanIcon from '@mui/icons-material/Lan';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/router'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { peerplay_ui_version } from '../resources/peerplay_tools/peerplay_ui/tool'
import { peerplay_cr_client_status, peerplay_cr_client_version } from '../resources/peerplay_tools/cr_client/tool'
import { peerplay_cr_server_status, peerplay_cr_server_version } from '../resources/peerplay_tools/cr_server/tool'
import { lan_play_status, lan_play_version } from '../resources/peerplay_tools/lan_play/tool'
import { ManageAccounts } from "@mui/icons-material";
const drawerWidth = 220;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function Layout({ children }) {
    const router = useRouter()
    const pathname = router.asPath.replace(".html", "")
    let name = pathname
    switch (pathname) {
        case "/home":
            name = "Home"
            break;
        case "/peerplay_accounts":
            name = "Peerplay Accounts Manager"
            break;
        case "/cr_client":
            name = "Peerplay Console Relay Client"
            break;
        case "/cr_server":
            name = "Peerplay Console Relay Server"
            break;
        case "/lan_play":
            name = "Lan Play Client"
            break;
        case "/settings":
            name = "Settings"
            break;
    }
    const theme = useTheme();
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const [status, setStatus] = useState({
        cr_server_running: false,
        cr_server: false,
        cr_client: false,
        lan_play: false,
    });
    const handleDrawerOpen = () => {

        setOpenDrawer(true);
    };

    const handleDrawerClose = () => {
        setOpenDrawer(false);
    };

    const refreshStatus = async () => {
        const server_status = await peerplay_cr_server_status(true);
        const newStatus = {
            cr_server_running: server_status.running,
            cr_server: server_status.started,
            cr_client: peerplay_cr_client_status(),
            lan_play: lan_play_status(),
        };
        setStatus(newStatus);
    };

    useEffect(() => {
        const intervalId = setInterval(refreshStatus, 1000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const [openAboutDialog, setOpenAboutDialog] = React.useState(false);
    const handleCloseAboutDialog = () => setOpenAboutDialog(false);
    const handleClickAboutDialog = () => setOpenAboutDialog(true);

    return (
        <Box sx={{ display: 'flex', overflow: "clip" }}>
            <title>Peerplay</title>
            <CssBaseline />
            <Dialog open={openAboutDialog} onClose={handleCloseAboutDialog}>
                <DialogTitle>About Peerplay</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"Peerplay GUI Version : " + peerplay_ui_version}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Peerplay CR_CLIENT Version : " + peerplay_cr_client_version}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Peerplay CR_SERVER Version : " + peerplay_cr_server_version}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Lan Play Version : " + lan_play_version}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseAboutDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <AppBar position="fixed" open={openDrawer}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(openDrawer && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {name}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={openDrawer}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    <ListItem key="/home" disablePadding>
                        <ListItemButton onClick={() => router.push('/home')} selected={pathname === "/home"}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>
                    <Divider>{openDrawer === true ? "Peerplay Network" : ""}</Divider>
                    <ListItem key="/peerplay_accounts" disablePadding>
                        <ListItemButton onClick={() => router.push('/peerplay_accounts')} selected={pathname === "/peerplay_accounts"}>
                            <ListItemIcon>
                                <ManageAccounts />
                            </ListItemIcon>
                            <ListItemText primary="Account Manager" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="/cr_client" disablePadding>
                        <ListItemButton onClick={() => router.push('/cr_client')} selected={pathname === "/cr_client"}>
                            <ListItemIcon>
                                <LanguageIcon style={{ color: status.cr_client ? "green" : "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Console Relay" secondary="Client" />
                        </ListItemButton>
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItem key="/cr_server" disablePadding>
                        <ListItemButton onClick={() => router.push('/cr_server')} selected={pathname === "/cr_server"}>
                            <ListItemIcon>
                                <DnsIcon style={{ color: status.cr_server ? (status.cr_server_running ? "green" : "orange") : "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Console Relay" secondary="Server" />
                        </ListItemButton>
                    </ListItem>
                    <Divider>{openDrawer === true ? "Lan Play" : ""}</Divider>
                    <ListItem key="/lan_play" disablePadding>
                        <ListItemButton onClick={() => router.push('/lan_play')} selected={pathname === "/lan_play"}>
                            <ListItemIcon>
                                <LanIcon style={{ color: status.lan_play ? "green" : "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Client" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem key="/settings" disablePadding>
                        <ListItemButton onClick={() => router.push('/settings')} selected={pathname === "/settings"}>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem key="/about" disablePadding>
                        <ListItemButton onClick={handleClickAboutDialog}>
                            <ListItemIcon>
                                <InfoIcon />
                            </ListItemIcon>
                            <ListItemText primary="About Peerplay" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }} style={{ textAlign: "center" }}>
                <DrawerHeader />
                {children}
            </Box>
        </Box>
    );
}