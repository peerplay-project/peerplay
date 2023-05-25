import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Store from 'electron-store';
import axios from 'axios';
import Divider from "@mui/material/Divider";
import { Delete, PermDeviceInformation } from '@mui/icons-material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tabs,
    Tab,
    Stack,
    List,
    IconButton,
    ListItemText,
    ListItem,
    ListItemSecondaryAction
} from '@mui/material';
let Reset_Key = ""
let Procedure = ""
let Error_Code = ""
let Error_Description = ""
let req_email = ""
let req_username = ""
let console_ip: ConsoleList = {
    PS3: "",
    PS4: "",
    PS5: "",
    XBOX_360: "",
    XBOX_ONE: "",
    XBOX_SERIES: "",
    SWITCH: "",
}
let console_gateway: ConsoleList = {
    PS3: "",
    PS4: "",
    PS5: "",
    XBOX_360: "",
    XBOX_ONE: "",
    XBOX_SERIES: "",
    SWITCH: "",
}
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
interface ConsoleList {
    PS3: string,
    PS4: string,
    PS5: string,
    XBOX_360: string,
    XBOX_ONE: string,
    XBOX_SERIES: string,
    SWITCH: string,
}
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

// Définir la forme des données à stocker
interface CRClientData {
    cr_server_address: string,
    cr_server_address_api: string,
    use_localhost_cr_server: boolean,
}

interface AccountData {
    username: string,
    email: string,
    password: string,
}

const cr_client_store = new Store<CRClientData>({
    name: 'cr_client-config',
});
const accountStore = new Store<AccountData>({
    name: 'accounts_list',
});

export default function Page(props) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const content = {
        'register_submit': 'Register',
        'login_submit': 'Login',
        'reset_submit': 'Reset Password',
        ...props.content
    };

    async function handleGetIPFromAccount(email: string, password: string, username: string) {
        const cr_client_data: CRClientData = cr_client_store.get('config');
        const url = `http://${cr_client_data.cr_server_address_api}/auth/login`;
        const params = {
            email: email,
            password: password
        };
        req_email = email
        req_username = username
        try {
            const response = await axios.post(url, null, { params: params });
            if (response.status === 200) {
                const token = response.data.jwt;
                const url = `http://${cr_client_data.cr_server_address_api}/console/ip_settings/get_ip_address`;
                const headers = {
                    Authorization: `Bearer ${token}`,
                };
                try {
                    const response = await axios.get(url, { headers });
                    if (response.status === 200) {
                        console_ip = response.data.console_ip
                        console_gateway = response.data.console_gateway
                        handleClickIPListDialog()
                    }
                } catch (error) { }
            }
        } catch (error) { }
    }

    // Fonction pour ajouter un compte à la liste
    const storeAddAccount = (account: AccountData) => {
        const accounts = accountStore.get('accounts_list', []);
        if (accounts.find((a) => a.email === account.email) === undefined) {
            const updatedAccounts = [...accounts, account];
            accountStore.set('accounts_list', updatedAccounts);
        } else {
            accounts[accounts.findIndex((a) => a.email === account.email)].password = account.password;
            accounts[accounts.findIndex((a) => a.email === account.email)].username = account.username;
            accountStore.set('accounts_list', accounts);
        }
    };

    // Fonction pour supprimer un compte de la liste
    const storeDeleteAccount = (email: string) => {
        const accounts = accountStore.get('accounts_list', []);
        const updatedAccounts = accounts.filter((account) => account.email !== email);
        accountStore.set('accounts_list', updatedAccounts);
    };

    // Fonction pour récupérer la liste des comptes
    const storeGetAccounts = () => {
        return accountStore.get('accounts_list', []);
    };

    const register_formik = useFormik({
        initialValues: { username: "", email: "", password: "", password_confirm: "" },
        validationSchema: Yup.object().shape({
            username: Yup.string().test(
                "username_check",
                "Please enter a correct email address",
                function (value) {
                    return this.parent.username !== "";

                }
            ),
            email: Yup.string().test(
                "email_check",
                "Please enter a correct email address",
                function (value) {
                    return this.parent.email !== "";

                }
            ),
            password: Yup.string().test(
                "password_check",
                "Please enter a password",
                function (value) {
                    return this.parent.password !== "";
                }
            ),
            password_confirm: Yup.string().test(
                "password_confirm_check",
                "Please enter the same password",
                function (value) {
                    return this.parent.password_confirm === this.parent.password;
                }
            ),
        }),
        onSubmit: async (values) => {
            Procedure = "L'Inscription"
            const cr_client_data: CRClientData = cr_client_store.get('config');
            const url = `http://${cr_client_data.cr_server_address_api}/auth/register`;
            const params = {
                username: values.username,
                email: values.email,
                password: values.password,
                confirmPassword: values.password_confirm
            };
            try {
                const response = await axios.post(url, null, { params });
                console.log(response)
                if (response.status === 200) {
                    storeAddAccount({ username: values.username, email: values.email, password: values.password });
                    handleClickRegisterDialog();
                }
            } catch (error) {
                if (error.response.status === 400) {
                    switch (error.response.data.code) {
                        case "ACCOUNT_ALREADY_EXISTS":
                            Error_Code = 'ACCOUNT_ALREADY_EXISTS'
                            Error_Description = "Un compte est deja crée avec cette adresse mail, veuillez vous connecter ou reinitialiser votre mot de passe"
                            break;
                        case "PASSWORD_MISSMATCH":
                            Error_Code = 'PASSWORD_MISSMATCH'
                            Error_Description = "Le Combo Mot de passe / Confirmation de mot de passe ne correspond pas"
                            break;
                        default:
                            Error_Code = 'UNKNOWN_ERROR'
                            Error_Description = "L'Erreur que vous rencontrez est inconnue, veuillez contacter le support de peerplay"
                            break;
                    }
                }
                else {
                    Error_Code = 'CONNECTION_ERROR'
                    Error_Description = "La connexion au Serveur Peerplay CR a Echouée ou le Serveur de destination a repondu avec une erreur 500, veuillez verifier votre connexion internet ou contactez l'hote du serveur ou le support de peerplay (si vous etes l'hote)"
                }
                handleClickErrorDialog();
            }
        }
    });
    const login_formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: Yup.object().shape({
            email: Yup.string().test(
                "email_check",
                "Please enter a correct email address",
                function (value) {
                    return this.parent.email !== "";

                }
            ),
            password: Yup.string().test(
                "password_check",
                "Please enter a password",
                function (value) {
                    return this.parent.password !== "";
                }
            ),
        }),
        onSubmit: async (values) => {
            Procedure = 'La Connexion'
            const cr_client_data: CRClientData = cr_client_store.get('config');
            const url = `http://${cr_client_data.cr_server_address_api}/auth/login`;
            const params = {
                email: values.email,
                password: values.password
            };
            try {
                const response = await axios.post(url, null, { params: params });

                if (response.status === 200) {
                    const responseData = response.data;
                    storeAddAccount({ username: responseData.username, email: values.email, password: values.password });
                    handleClickConnectDialog();
                }
            } catch (error) {
                if (error.response.status === 401) {
                    switch (error.response.data.code) {
                        case "ACCOUNT_NOT_FOUND":
                            Error_Code = 'ACCOUNT_NOT_FOUND'
                            Error_Description = "Le compte n'a pas été trouvé"
                            break;
                        case "INCORRECT_PASSWORD":
                            Error_Code = 'INCORRECT_PASSWORD'
                            Error_Description = "Le Mot de Passe est Incorrect"
                            break;
                        default:
                            Error_Code = 'UNKNOWN_ERROR'
                            Error_Description = "L'Erreur que vous rencontrez est inconnue, veuillez contacter le support de peerplay"
                            break;
                    }
                } else {
                    if (error.response.status === 400) {
                        Error_Code = 'BAD_REQUEST'
                        Error_Description = "Des elements requis sont manquant, veuillez verifier si les informations rentrés sont correctes"
                    }
                    else {
                        Error_Code = 'CONNECTION_ERROR'
                        Error_Description = "La connexion au Serveur Peerplay CR a Echouée ou le Serveur de destination a repondu avec une erreur 500, veuillez verifier votre connexion internet ou contactez l'hote du serveur ou le support de peerplay (si vous etes l'hote)"
                    }
                }
                handleClickErrorDialog();
            }
        },
    });
    const reset_formik = useFormik({
        initialValues: { email: "", reset_key: "", password: "", new_password: "", new_password_confirm: "" },
        validationSchema: Yup.object().shape({
            email: Yup.string().test(
                "email_check",
                "Please enter a correct email address",
                function (value) {
                    return this.parent.email !== "";

                }
            ),
            password: Yup.string().test(
                "password_check",
                "Please enter the original password or reset key",
                function (value) {
                    return this.parent.password !== "" || this.parent.reset_key !== "";
                }
            ),
            reset_key: Yup.string().test(
                "reset_key_check",
                "Please enter the reset key or the original password",
                function (value) {
                    return this.parent.reset_key !== "" || this.parent.password !== "";

                }
            ),
            new_password: Yup.string().test(
                "password_check",
                "Please enter a password",
                function (value) {
                    return this.parent.new_password !== "";
                }
            ),
            new_password_confirm: Yup.string().test(
                "password_confirm_check",
                "Please enter the same password",
                function (value) {
                    return this.parent.new_password_confirm === this.parent.new_password;
                }
            ),
        }),
        onSubmit: async (values) => {
            Procedure = 'La Réinitialisation du Mot de Passe'
            const cr_client_data: CRClientData = cr_client_store.get('config')
            const url = `http://${cr_client_data.cr_server_address_api}/auth/reset_password`;
            const params = {
                email: values.email,
                oldPassword: values.password,
                resetKey: values.reset_key,
                newPassword: values.new_password,
                confirmNewPassword: values.new_password_confirm
            };
            try {
                const response = await axios.post(url, null, { params: params });
                if (response.status === 200 && response.data.status === 'SUCCESS') {
                    const { code, account_data } = response.data;
                    handleClickResetDialog()
                } else {
                    Error_Code = 'UNEXPECTED_RESPONSE'
                    Error_Description = "La Réponse que vous rencontrez est inconnue, veuillez contacter le support de peerplay"
                    handleClickErrorDialog()
                }
            } catch (error) {
                if (error.response.status === 401) {
                    switch (error.response.data.code) {
                        case 'ACCOUNT_NOT_FOUND':
                            Error_Code = 'ACCOUNT_NOT_FOUND'
                            Error_Description = "Le compte n'a pas été trouvé"
                            break;
                        case 'INCORRECT_RESET_CREDENTIALS':
                            Error_Code = 'INCORRECT_RESET_CREDENTIALS'
                            Error_Description = "Les informations demandées sont incorrectes"
                            break;
                        default:
                            Error_Code = 'UNKNOWN_ERROR'
                            Error_Description = "L'Erreur que vous rencontrez est inconnue, veuillez contacter le support de peerplay"
                    }
                } else {
                    if (error.response.status === 400) {
                        Error_Code = 'BAD_REQUEST'
                        Error_Description = "Des elements requis sont manquant, veuillez verifier si les informations rentrés sont correctes"
                    }
                    else {
                        Error_Code = 'CONNECTION_ERROR'
                        Error_Description = "La connexion au Serveur Peerplay CR a Echouée ou le Serveur de destination a repondu avec une erreur 500, veuillez verifier votre connexion internet ou contactez l'hote du serveur ou le support de peerplay (si vous etes l'hote)"
                    }
                }
                handleClickErrorDialog();
            }
        }
    });
    const [accounts, setAccounts] = useState([]);
    useEffect(() => {
        const intervalId = setInterval(() => {
            const fetchedAccounts = storeGetAccounts();
            setAccounts(fetchedAccounts);
        }, 1000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleDeleteAccount = (email) => {
        storeDeleteAccount(email);
        const updatedAccounts = accounts.filter((account) => account.email !== email);
        setAccounts(updatedAccounts);
    };
    // Dialogs
    const [openIPListDialog, setOpenIPListDialog] = React.useState(false);
    const handleCloseIPListDialog = () => setOpenIPListDialog(false);
    const handleClickIPListDialog = () => setOpenIPListDialog(true);
    const [openConnectDialog, setOpenConnectDialog] = React.useState(false);
    const handleCloseConnectDialog = () => setOpenConnectDialog(false);
    const handleClickConnectDialog = () => setOpenConnectDialog(true);
    const [openRegisterDialog, setOpenRegisterDialog] = React.useState(false);
    const handleCloseRegisterDialog = () => setOpenRegisterDialog(false);
    const handleClickRegisterDialog = () => setOpenRegisterDialog(true);
    const [openResetDialog, setOpenResetDialog] = React.useState(false);
    const handleCloseResetDialog = () => setOpenResetDialog(false);
    const handleClickResetDialog = () => setOpenResetDialog(true);
    const [openErrorDialog, setOpenErrorDialog] = React.useState(false);
    const handleCloseErrorDialog = () => setOpenErrorDialog(false);
    const handleClickErrorDialog = () => setOpenErrorDialog(true);
    // @ts-ignore
    return (
        <React.Fragment>
            <Dialog PaperProps={{ style: { minWidth: '950px' } }} open={openIPListDialog} onClose={handleCloseIPListDialog}>
                <DialogTitle>Parametrage IP</DialogTitle>
                <DialogContent>
                <Stack direction="column" spacing={0.2}>
                    <DialogContentText><b>{"Voici les parametres IP en fonction de la console"}</b></DialogContentText>
                    <DialogContentText><b>{"Ces parametres sont valable pour le compte suivant Username : " + req_username + " , Email Associé : " + req_email}</b></DialogContentText>
                    <DialogContentText><b>{"ATTENTION, ces parametres ne doivent pas etre partagés entre plusieurs utilisateurs"}</b></DialogContentText>
                    <Stack textAlign="center" direction="column" spacing={0.1}>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>Console</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText><b>IP Address</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText><b>Subnet Mask</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText><b>Gateway</b></DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>(Console)</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText><b>(Adresse IP)</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText><b>(Masque de Sous Réseau)</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText><b>(Passerelle)</b></DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>Switch</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.SWITCH}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.SWITCH}</DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>PS3</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.PS3}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.PS3}</DialogContentText>
                            </Grid>   
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>PS4</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.PS4}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.PS4}</DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>PS5</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.PS5}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.PS5}</DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>XBOX 360</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.XBOX_360}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.XBOX_360}</DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>XBOX ONE</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.XBOX_ONE}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.XBOX_ONE}</DialogContentText>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <DialogContentText><b>XBOX SERIES</b></DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_ip.XBOX_SERIES}</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>255.0.0.0</DialogContentText>
                            </Grid>
                            <Grid item xs={3}>
                                <DialogContentText>{console_gateway.XBOX_SERIES}</DialogContentText>
                            </Grid>
                        </Grid>
                    </Stack>
                </Stack>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseIPListDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog maxWidth="md" open={openConnectDialog} onClose={handleCloseConnectDialog}>
                <DialogTitle>Connecté</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"Vous etes Authentifié avec Succés, ajout du profil coté client"}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseConnectDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog maxWidth="md" open={openRegisterDialog} onClose={handleCloseRegisterDialog}>
                <DialogTitle>Inscrit</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"l'Inscription s'est bien déroulé, ajout du profil coté client"}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Voici des informations importantes concernant votre Compte"}</DialogContentText>
                    <DialogContentText>{"Clé de Réinitialisation : " + Reset_Key}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Veillez a Bien Conserver Cette Clé (Elle vous sera demandé pour réinitialiser votre mot de passe si vous l'avez perdu"}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseRegisterDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog maxWidth="md" open={openResetDialog} onClose={handleCloseResetDialog}>
                <DialogTitle>Mot de passe réinitialisé avec succés</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"le mot de passe a bien été réinitialisé"}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Voici votre nouvelle clé de réinitialisation"}</DialogContentText>
                    <DialogContentText>{Reset_Key}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Veillez a Bien Conserver Cette Clé (Elle vous sera demandé pour réinitialiser votre mot de passe si vous le perdez a nouveau"}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseConnectDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog maxWidth="md" open={openErrorDialog} onClose={handleCloseErrorDialog}>
                <DialogTitle>{"Une Erreur est survenue lors de " + Procedure}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{Error_Code}</DialogContentText>
                    <DialogContentText>{Error_Description}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Veuillez Ressayer"}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseErrorDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container>
                <Grid item xs={11} md={6}>
                    <Box py={0} style={{ minHeight: '475px', height: '100%', }}>
                        <Box>
                            <Container>
                                <Typography style={{ textAlign: "center" }} variant="subtitle1" gutterBottom>Liste des
                                    Comptes</Typography>
                                <List>
                                    {accounts.map((account) => (
                                        <ListItem key={account.email}>
                                            <Grid container alignItems="center">
                                                <Grid item md={10}>
                                                    <ListItemText primary={account.username} secondary={account.email} />
                                                </Grid>
                                                <Grid item md={7}>
                                                    <ListItemSecondaryAction>
                                                        <IconButton edge="end"
                                                            onClick={() => handleGetIPFromAccount(account.email, account.password, account.username)}>
                                                            <PermDeviceInformation />
                                                        </IconButton>
                                                        <IconButton edge="end"
                                                            onClick={() => handleDeleteAccount(account.email)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    ))}
                                </List>
                            </Container>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={17} md={6} justifyContent="center">
                    <Box py={0} display="flex">
                        <Container>
                            <Box sx={{ width: '100%' }}>
                                <Tabs value={value} onChange={handleChange} centered>
                                    <Tab label="Register" {...a11yProps(0)} />
                                    <Tab label="Login" {...a11yProps(1)} />
                                    <Tab label="Reset Password" {...a11yProps(7)} />
                                </Tabs>
                                <TabPanel value={value} index={0}>
                                    <form onSubmit={register_formik.handleSubmit}>
                                        <Grid container spacing={0.5}>
                                            <Grid item xs={17}>
                                                <Stack direction="column" spacing={0.5}>
                                                    <TextField id="username"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="username"
                                                        type="string"
                                                        onChange={register_formik.handleChange}
                                                        value={register_formik.values.username}
                                                        label="Nom d'Utilisateur"
                                                    />
                                                    {register_formik.touched.username && register_formik.errors.username ? (
                                                        <div>{register_formik.errors.username}</div>
                                                    ) : null}
                                                    <TextField id="email"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="email"
                                                        type="email"
                                                        onChange={register_formik.handleChange}
                                                        value={register_formik.values.email}
                                                        label="Adresse Email"
                                                    />
                                                    {register_formik.touched.email && register_formik.errors.email ? (
                                                        <div>{register_formik.errors.email}</div>
                                                    ) : null}
                                                    <TextField id="password"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="password"
                                                        type="password"
                                                        onChange={register_formik.handleChange}
                                                        value={register_formik.values.password}
                                                        label="Mot de Passe"
                                                    />
                                                    {register_formik.touched.password && register_formik.errors.password ? (
                                                        <div>{register_formik.errors.password}</div>
                                                    ) : null}
                                                    <TextField id="password_confirm"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="password_confirm"
                                                        type="password"
                                                        onChange={register_formik.handleChange}
                                                        value={register_formik.values.password_confirm}
                                                        label="Confirmation Mot de Passe"
                                                    />
                                                    {register_formik.touched.password_confirm && register_formik.errors.password_confirm ? (
                                                        <div>{register_formik.errors.password_confirm}</div>
                                                    ) : null}
                                                    <Button type="submit" fullWidth variant="contained" color="primary">
                                                        {content['register_submit']}
                                                    </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </TabPanel>
                                <TabPanel value={value} index={1}>
                                    <form onSubmit={login_formik.handleSubmit}>
                                        <Grid container spacing={0.5}>
                                            <Grid item xs={17}>
                                                <Stack direction="column" spacing={0.5}>
                                                    <TextField id="email"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="email"
                                                        type="email"
                                                        onChange={login_formik.handleChange}
                                                        value={login_formik.values.email}
                                                        label="Adresse Email"

                                                    />
                                                    {login_formik.touched.email && login_formik.errors.email ? (
                                                        <div>{login_formik.errors.email}</div>
                                                    ) : null}
                                                    <TextField id="password"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="password"
                                                        type="password"
                                                        onChange={login_formik.handleChange}
                                                        value={login_formik.values.password}
                                                        label="Mot de Passe"

                                                    />
                                                    {login_formik.touched.password && login_formik.errors.password ? (
                                                        <div>{login_formik.errors.password}</div>
                                                    ) : null}

                                                    <Button type="submit" fullWidth variant="contained" color="primary">
                                                        {content['login_submit']}
                                                    </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </TabPanel>
                                <TabPanel value={value} index={2}>
                                    <form onSubmit={reset_formik.handleSubmit}>
                                        <Grid container>
                                            <Grid item xs={17}>
                                                <Stack direction="column" spacing={0.5}>
                                                    <TextField id="email"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="email"
                                                        type="email"
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.email}
                                                        label="Adresse Email"

                                                    />
                                                    {reset_formik.touched.email && reset_formik.errors.email ? (
                                                        <div>{reset_formik.errors.email}</div>
                                                    ) : null}
                                                    <TextField id="password"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="password"
                                                        type="password"
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.password}
                                                        label="Mot de Passe"

                                                    />
                                                    <TextField id="reset_key"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="reset_key"
                                                        type="string"
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.reset_key}
                                                        label="Clé de Réinitialisation"
                                                    />
                                                    {reset_formik.touched.reset_key && reset_formik.errors.reset_key ? (
                                                        <div>{reset_formik.errors.reset_key}</div>
                                                    ) : null}
                                                    <TextField id="new_password"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="new_password"
                                                        type="password"
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.new_password}
                                                        label="Nouveau Mot de Passe"
                                                    />
                                                    {reset_formik.touched.new_password && reset_formik.errors.new_password ? (
                                                        <div>{reset_formik.errors.new_password}</div>
                                                    ) : null}
                                                    <TextField id="new_password_confirm"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="new_password_confirm"
                                                        type="password"
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.new_password_confirm}
                                                        label="Confirmation Nouveau Mot de Passe"
                                                    />
                                                    {reset_formik.touched.new_password_confirm && reset_formik.errors.new_password_confirm ? (
                                                        <div>{reset_formik.errors.new_password_confirm}</div>
                                                    ) : null}
                                                    <Button type="submit" fullWidth variant="contained" color="primary">
                                                        {content['reset_submit']}
                                                    </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </TabPanel>
                            </Box>
                        </Container>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}
