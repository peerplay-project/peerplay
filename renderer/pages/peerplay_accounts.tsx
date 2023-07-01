import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Carousel from 'react-material-ui-carousel';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Store from 'electron-store';
import axios from 'axios';
import {
    AccountCircle,
    Block,
    Delete,
    MoreHoriz,
    NetworkCheck,
    PermDeviceInformation,
    SettingsEthernet,
    SignalCellular1Bar,
    SignalCellular2Bar,
    SignalCellular3Bar,
    SignalCellular4Bar,
    SignalCellularConnectedNoInternet1Bar,
    SignalCellularNodata,
    Wifi
} from '@mui/icons-material';
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
    RadioGroup,
    Radio,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Switch,
    Divider
} from '@mui/material';
import { useSnackbar } from 'notistack';
let Reset_Key = ""
let Procedure = ""
let Error_Code = ""
let Error_Description = ""
let Error_Solution = ""
let req_email = ""
let req_username = ""
let targetedAccount = { username: "", email: "", password: "" };
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
    source: string,
    current_filter: string,
}

const cr_client_store = new Store<CRClientData>({
    name: 'cr_client-config',
});
const accountStore = new Store<AccountData>({
    name: 'accounts_list',
});

function NetworkQualityRender(value) {
    switch (value) {
        case "NT1":
            return <SignalCellular4Bar fontSize={"small"} />;
        case "NT2":
            return <SignalCellular3Bar fontSize={"small"} />;
        case "NT3":
            return <SignalCellular2Bar fontSize={"small"} />;
        case "NT4":
            return <SignalCellular1Bar fontSize={"small"} />;
        case "NT5":
            return <SignalCellularConnectedNoInternet1Bar fontSize={"small"} />;
        default:
            return <SignalCellularNodata fontSize={"small"} />;
    }
}

function ConnectMethodRender(value) {
    switch (value) {
        case 'ETH':
            return <SettingsEthernet fontSize={"small"} />;
        case 'WLAN':
            return <Wifi fontSize={"small"} />;
        default:
            return <MoreHoriz fontSize={"small"} />;
    }
}

const PasswordKeyForm = ({ handleClose }) => {
    const { enqueueSnackbar } = useSnackbar();
    const validationSchema = Yup.object({
        random_password: Yup.boolean(),
        network_key: Yup
            .string()
            .max(32, 'Password exceeds the limit of 32 characters')
            .nullable(),
    });

    const formik = useFormik({
        initialValues: {
            random_password: false,
            network_key: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            if (values.random_password) {
                values.network_key = "";
            }
            handleClose()
            console.log("trying to get JWT")
            console.log(values)
            const cr_client_data: CRClientData = cr_client_store.get('config');
            const url = `http://${cr_client_data.cr_server_address_api}/auth/login`;
            const params = {
                email: targetedAccount.email,
                password: targetedAccount.password
            };
            try {
                const response = await axios.post(url, null, { params: params });
                if (response.status === 200) {
                    console.log("Parse JWT and use it for the next request")
                    const token = response.data.jwt;
                    console.log(token)
                    let config = {
                        method: 'post',
                        url: `http://${cr_client_data.cr_server_address_api}/account/filter/filter_settings/password_key?random_password=${values.random_password}&network_key=${values.network_key}`,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    };
                    try {
                        const response = await axios.request(config);
                        if (response.status === 200) {
                            console.log("Success")
                            enqueueSnackbar(`Filter Successfuly Updated for : ${targetedAccount.username}, new filter is : PWD_${response.data.new_informations.new_password}`, { variant: 'success' });
                        }
                    } catch (error) {
                        console.log("error")
                        if (error.response) {
                            console.log(error.response.data)
                            enqueueSnackbar("An error occured on Filter Update : " + error.response.data.code, { variant: 'error' });
                        }
                    }
                }
            } catch (error) {
                console.log("Error")
                enqueueSnackbar("An error occured on Authentification : " + error.response.data.code, { variant: 'error' });
            }
        },
    });
    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={1}>
                    <FormControlLabel control={<Switch id="random_password"
                        name="random_password" onChange={formik.handleChange} />} label="Use a Random Password" />
                    <TextField
                        fullWidth
                        id="network_key"
                        name="network_key"
                        label="Network Key"
                        value={formik.values.network_key}
                        onChange={formik.handleChange}
                        error={formik.touched.network_key && Boolean(formik.errors.network_key)}
                        helperText={formik.touched.network_key && formik.errors.network_key}
                        disabled={formik.values.random_password}
                    />
                    <Button color="primary" variant="contained" fullWidth type="submit">
                        Submit
                    </Button>
                </Stack>
            </form>
        </div>
    );
};

const GeographicKeyForm = ({ handleClose }) => {
    const { enqueueSnackbar } = useSnackbar();
    const continentToFullName = {
        AM: 'Americas',
        EU: 'Europe',
        AS: 'Asia',
        AF: 'Africa',
        OC: 'Oceania',
    };

    const [countries, setCountries] = useState([]);
    const validationSchema = Yup.object({
        geographic_network_type: Yup.string().required('Geographic Network Type is required'),
        continent: Yup.string().test('continent-validation', 'Continent is required', function () {
            const { geographic_network_type, continent } = this.parent;
            if ((geographic_network_type === 'CONTINENTAL' || geographic_network_type === 'COUNTRY') && !continent) {
                return false; // Validation échoue si continent est requis mais non renseigné
            }
            return true; // Validation réussie dans les autres cas
        }),
        country: Yup.string().test('country-validation', 'Country is required', function () {
            const { geographic_network_type, continent, country } = this.parent;
            if (geographic_network_type === 'COUNTRY' && (!continent || !country)) {
                return false; // Validation échoue si country est requis mais non renseigné
            }
            return true; // Validation réussie dans les autres cas
        })
    });
    const formik = useFormik({
        initialValues: {
            geographic_network_type: '',
            continent: '',
            country: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            handleClose()
            console.log("trying to get JWT")
            console.log(values)
            const cr_client_data: CRClientData = cr_client_store.get('config');
            const url = `http://${cr_client_data.cr_server_address_api}/auth/login`;
            const params = {
                email: targetedAccount.email,
                password: targetedAccount.password
            };
            try {
                const response = await axios.post(url, null, { params: params });
                if (response.status === 200) {
                    console.log("Parse JWT and use it for the next request")
                    const token = response.data.jwt;
                    console.log(token)
                    let config = {
                        method: 'post',
                        url: `http://${cr_client_data.cr_server_address_api}/account/filter/filter_settings/geographic_key?geographic_network_type=${values.geographic_network_type}&continent=${values.continent}&country=${values.country}`,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    };
                    try {
                        const response = await axios.request(config);
                        if (response.status === 200) {
                            console.log("Success")
                            enqueueSnackbar(`Filter Successfuly Updated for : ${targetedAccount.username}, new filter is : GEO_${response.data.new_informations.new_password}`, { variant: 'success' });
                        }
                    } catch (error) {
                        console.log("error")
                        if (error) {
                            enqueueSnackbar("An error occured on Filter Update : " + error.response.data.code, { variant: 'error' });
                        }
                    }
                }
            } catch (error) {
                console.log("Error")
                enqueueSnackbar("An error occured on Authentifcation : " + error.response.data.code, { variant: 'error' });
            }
        },
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch(
                    `https://restcountries.com/v2/region/${continentToFullName[formik.values.continent]?.toLowerCase()}`
                );
                const data = await response.json();
                setCountries(
                    data.map((country) => ({
                        name: country.name,
                        code: country.alpha3Code,
                    }))
                );
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        if (formik.values.continent) {
            fetchCountries();
        } else {
            setCountries([]);
        }
    }, [formik.values.continent]);

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth
                    id="geographic_network_type"
                    name="geographic_network_type"
                    label="Geographic Network Type"
                    select
                    value={formik.values.geographic_network_type}
                    onChange={formik.handleChange}
                    error={formik.touched.geographic_network_type && Boolean(formik.errors.geographic_network_type)}
                    helperText={formik.touched.geographic_network_type && formik.errors.geographic_network_type}
                >
                    <MenuItem value="WORLD">World</MenuItem>
                    <MenuItem value="CONTINENTAL">Continental</MenuItem>
                    <MenuItem value="COUNTRY">Country</MenuItem>
                </TextField>
                <TextField
                    fullWidth
                    id="continent"
                    name="continent"
                    label="Continent"
                    select
                    value={formik.values.continent}
                    onChange={formik.handleChange}
                    error={formik.touched.continent && Boolean(formik.errors.continent)}
                    helperText={formik.touched.continent && formik.errors.continent}
                    disabled={formik.values.geographic_network_type === 'WORLD'}
                >
                    <MenuItem value="AM">Americas</MenuItem>
                    <MenuItem value="EU">Europe</MenuItem>
                    <MenuItem value="AF">Africa</MenuItem>
                    <MenuItem value="AS">Asia</MenuItem>
                    <MenuItem value="OC">Oceania</MenuItem>
                </TextField>
                <TextField
                    fullWidth
                    id="country"
                    name="country"
                    label="Country"
                    select
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    error={formik.touched.country && Boolean(formik.errors.country)}
                    helperText={formik.touched.country && formik.errors.country}
                    disabled={
                        formik.values.geographic_network_type === 'WORLD' ||
                        formik.values.geographic_network_type === 'CONTINENTAL' ||
                        countries.length === 0
                    }
                >
                    {/* Options pour le pays */}
                    {countries.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                            {country.name} - {country.code}
                        </MenuItem>
                    ))}
                </TextField>
                <Button color="primary" variant="contained" fullWidth type="submit">
                    Submit
                </Button>
            </form>
        </div>
    );
};
export default function Page(props) {
    const content = {
        'register_submit': 'Register',
        'login_submit': 'Login',
        'reset_submit': 'Reset Password',
        ...props.content
    };

    async function handleGetIPFromAccount(email: string, password: string, username: string) {
        Procedure = 'La Recuperation des Parametres IP'
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
                    const response = await axios.get(url, { headers: headers });
                    if (response.status === 200) {
                        console_ip = response.data.console_ip
                        console_gateway = response.data.console_gateway
                        handleClickIPListDialog()
                    }
                } catch (error) {
                    if (error.response) {
                        if (error.response.status === 401) {
                            switch (error.response.data.CODE) {
                                case "INVALID_JWT":
                                    Error_Code = 'INVALID_JWT'
                                    Error_Description = "Le JWT Fourni est Invalide"
                                    Error_Solution = "Veuillez fournir un JWT valide pour ce serveur"
                                    break;
                                case "INVALID_JWT_SIGNATURE":
                                    Error_Code = 'INVALID_JWT_SIGNATURE'
                                    Error_Description = "La Signature de ce JWT est Invalide, A Expiré ou Appartient a un autre serveur"
                                    Error_Solution = "Veuillez vous connecter avec votre compte pour obtenir un JWT valide pour ce serveur"
                                    break;
                            }
                        }
                        else {
                            Error_Code = 'ERROR_500'
                            Error_Description = "Le Serveur de destination a repondu avec une erreur 500"
                            Error_Solution = "Veuillez contactez l'hote du serveur auquel vous etes relié ou le support de peerplay (si vous utilisez le serveur integré a l'application)"
                        }
                    } else {
                        Error_Code = 'CONNECTION_ERROR'
                        Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                        Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous etes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application et que ce dernier est bien ouvert)"
                    }
                    enqueueSnackbar(Error_Description, { variant: 'error' });
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    switch (error.response.data.code) {
                        case "ACCOUNT_NOT_FOUND":
                            Error_Code = 'ACCOUNT_NOT_FOUND'
                            Error_Description = "Le compte n'a pas été trouvé et n'est pas accessible depuis le serveur ciblé"
                            Error_Solution = "Veuillez Essayer de changer de serveur ou réessayer plus tard"
                            break;
                        case "INCORRECT_PASSWORD":
                            Error_Code = 'INCORRECT_PASSWORD'
                            Error_Description = "Le Mot de Passe du compte est incorrect (Il est possible que cette sauvegarde ne soit pas a jour)"
                            Error_Solution = "Veuillez vous réauthentifier ou réinitialiser votre mot de passe si vous n'avez"
                            break;
                        default:
                            Error_Code = 'UNKNOWN_ERROR'
                            Error_Description = "L'Erreur que vous rencontrez est inconnue."
                            Error_Solution = "Veuillez contacter le support de Peerplay"
                            break;
                    }
                } else if (error.response.status === 400) {
                    Error_Code = 'BAD_REQUEST'
                    Error_Description = "Des éléments requis sont manquants"
                    Error_Solution = "Veuillez vérifier que tous les champs necessaires sont remplis"
                } else {
                    Error_Code = 'ERROR_500'
                    Error_Description = "Le Serveur de destination a répondu avec une erreur 500."
                    Error_Solution = "Veuillez contactez l'hôte du serveur ou le support de Peerplay (si vous êtes l'hôte)"
                }
            } else {
                Error_Code = 'CONNECTION_ERROR'
                Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous êtes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application et que celui çi est bien ouvert)"
            }
            enqueueSnackbar(Error_Description, { variant: 'error' });
        }
    }

    async function networkTest(force_test: boolean): Promise<{ result: { network_type: string, connect_type: string } | undefined, error: string }> {
        const cr_client_data: CRClientData = cr_client_store.get('config');
        const config = {
            timeout: 30000,
            method: 'post',
            url: `http://${cr_client_data.cr_server_address_api}/account/filter/filter_settings/refresh_network_type`,
            params: {
                force_test: force_test,
                allow_empty: 'true'
            }
        };
        try {
            const response = await axios.request(config);
            console.log("DATA")
            console.log(response.data.new_informations)
            if (response.status === 200) {
                if (response.data.new_informations.new_network_type !== undefined && response.data.new_informations.new_connect_type !== undefined) {
                    console.log("DETAILS")
                    console.log(response.data.new_informations.new_network_type)
                    console.log(response.data.new_informations.new_connect_type)
                    return {
                        result: {
                            network_type: 'NT' + response.data.new_informations.new_network_type,
                            connect_type: response.data.new_informations.new_connect_type
                        },
                        error: undefined
                    }
                }
                else {
                    return {
                        result: undefined,
                        error: "No Data Found"
                    }
                }
            }
            else {
                return {
                    result: undefined,
                    error: "Response Status Not 200"
                }
            }
        } catch (error) {
            if (error.response === undefined) {
                console.log(`Cannot Connect To Server`)
                return {
                    result: undefined,
                    error: `Cannot Connect To Server`
                }
            }
            else
            {
                console.log(error.response.data.errors[0])
                return {
                    result: undefined,
                    error: `${error.response.data.errors[0]}`
                }
            }
            
        }
    }

    async function handleSwitchNetworkCheckAccount(email: string, password: string, username: string) {
        const cr_client_data: CRClientData = cr_client_store.get('config');
        const url = `http://${cr_client_data.cr_server_address_api}/auth/login`;
        const params = {
            email: email,
            password: password
        }
        enqueueSnackbar(`Trying to Enable / Disable Network Check for : ${username}`, { variant: 'info' });
        try {
            console.log("Stage 1")
            const response = await axios.post(url, null, { params: params });
            if (response.status === 200) {
                const token = response.data.jwt;
                try {
                    const config = {
                        method: 'post',
                        url: `http://${cr_client_data.cr_server_address_api}/account/filter/filter_settings/network_filtration`,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    };
                    try {
                        console.log("Stage 2")
                        const response2 = await axios.request(config);
                        if (response2.status === 200) {
                            const config2 = {
                                method: 'post',
                                url: `http://${cr_client_data.cr_server_address_api}/account/filter/filter_settings/refresh_network_type`,
                            };
                            try {
                                console.log("Stage 3")
                                const response3 = await axios.request(config2);
                                if (response3.status === 200) {
                                    if (response3.data.new_informations.new_network_type !== undefined) {
                                        setNetworkStatus({ network_quality_level: 'NT' + response3.data.new_informations.new_network_type, connect_method: response3.data.new_informations.new_connect_type })
                                    }
                                    else {
                                        setNetworkStatus({ network_quality_level: "N/A", connect_method: "N/A" })
                                    }
                                    enqueueSnackbar(`Network Filtration for ${username} is set to : ${response2.data.strict}`, { variant: 'success' });
                                }
                            }
                            catch (error) {
                                enqueueSnackbar("Cannot Refresh Network Quality :" + error.response.data.code, { variant: 'error' });
                            }

                        }
                    }
                    catch (error) {
                        enqueueSnackbar("Cannot Enable/Disable Network Quality Filtering :" + error.response.data.code, { variant: 'error' });
                    }
                } catch (error) {
                    if (error.response) {
                        if (error.response.status === 401) {
                            switch (error.response.data.CODE) {
                                case "INVALID_JWT":
                                    Error_Code = 'INVALID_JWT'
                                    Error_Description = "Le JWT Fourni est Invalide"
                                    Error_Solution = "Veuillez fournir un JWT valide pour ce serveur"
                                    break;
                                case "INVALID_JWT_SIGNATURE":
                                    Error_Code = 'INVALID_JWT_SIGNATURE'
                                    Error_Description = "La Signature de ce JWT est Invalide, A Expiré ou Appartient a un autre serveur"
                                    Error_Solution = "Veuillez vous connecter avec votre compte pour obtenir un JWT valide pour ce serveur"
                                    break;
                            }
                        }
                        else {
                            Error_Code = 'ERROR_500'
                            Error_Description = "Le Serveur de destination a repondu avec une erreur 500"
                            Error_Solution = "Veuillez contactez l'hote du serveur auquel vous etes relié ou le support de peerplay (si vous utilisez le serveur integré a l'application)"
                        }
                    } else {
                        Error_Code = 'CONNECTION_ERROR'
                        Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                        Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous etes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application et que ce dernier est bien ouvert)"
                    }
                    enqueueSnackbar(Error_Description, { variant: 'error' });
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    switch (error.response.data.code) {
                        case "ACCOUNT_NOT_FOUND":
                            Error_Code = 'ACCOUNT_NOT_FOUND'
                            Error_Description = "Le compte n'a pas été trouvé et n'est pas accessible depuis le serveur ciblé"
                            Error_Solution = "Veuillez Essayer de changer de serveur ou réessayer plus tard"
                            break;
                        case "INCORRECT_PASSWORD":
                            Error_Code = 'INCORRECT_PASSWORD'
                            Error_Description = "Le Mot de Passe du compte est incorrect (Il est possible que cette sauvegarde ne soit pas a jour)"
                            Error_Solution = "Veuillez vous réauthentifier ou réinitialiser votre mot de passe si vous n'avez"
                            break;
                        default:
                            Error_Code = 'UNKNOWN_ERROR'
                            Error_Description = "L'Erreur que vous rencontrez est inconnue."
                            Error_Solution = "Veuillez contacter le support de Peerplay"
                            break;
                    }
                } else if (error.response.status === 400) {
                    Error_Code = 'BAD_REQUEST'
                    Error_Description = "Des éléments requis sont manquants"
                    Error_Solution = "Veuillez vérifier que tous les champs necessaires sont remplis"
                } else {
                    Error_Code = 'ERROR_500'
                    Error_Description = "Le Serveur de destination a répondu avec une erreur 500."
                    Error_Solution = "Veuillez contactez l'hôte du serveur ou le support de Peerplay (si vous êtes l'hôte)"
                }
            } else {
                Error_Code = 'CONNECTION_ERROR'
                Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous êtes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application et que celui çi est bien ouvert)"
            }
            enqueueSnackbar(Error_Description, { variant: 'error' });
        }
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
            accounts[accounts.findIndex((a) => a.email === account.email)].current_filter = account.current_filter;
            accounts[accounts.findIndex((a) => a.email === account.email)].source = account.source
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
            username: Yup.string().required("Please enter a correct username"),
            email: Yup.string().email("Please enter a correct email address").required("Please enter a correct email address"),
            password: Yup.string().required("Please enter a password"),
            password_confirm: Yup.string().test(
                "password_confirm_check",
                "Please enter the same password",
                function (value) {
                    return value === this.parent.password || !this.parent.password;
                }
            )
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
                    storeAddAccount({ username: values.username, email: values.email, password: values.password, current_filter: "undefined", source: "" });
                    Reset_Key = response.data.account_data.reset_key
                    handleClickRegisterDialog();
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 400) {
                        switch (error.response.data.code) {
                            case "ACCOUNT_ALREADY_EXISTS":
                                Error_Code = 'ACCOUNT_ALREADY_EXISTS'
                                Error_Description = "Un compte est deja crée avec cette adresse mail"
                                Error_Solution = "Veuillez vous connecter ou reinitialiser votre mot de passe"
                                break;
                            case "PASSWORD_MISSMATCH":
                                Error_Code = 'PASSWORD_MISSMATCH'
                                Error_Description = "Le Combo Mot de passe / Confirmation de mot de passe ne correspond pas"
                                Error_Solution = "Veuillez verifier que les deux champs sont identiques"
                                break;
                            default:
                                Error_Code = 'UNKNOWN_ERROR'
                                Error_Description = "L'Erreur que vous rencontrez est inconnue"
                                Error_Solution = "Veuillez contacter le support de Peerplay"
                                break;
                        }
                    }
                    else {
                        Error_Code = 'ERROR_500'
                        Error_Description = "Le Serveur de destination a repondu avec une erreur 500"
                        Error_Solution = "Veuillez contactez l'hote du serveur auquel vous etes relié ou le support de peerplay (si vous utilisez le serveur integré a l'application)"
                    }
                } else {
                    Error_Code = 'CONNECTION_ERROR'
                    Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                    Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous etes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application et que ce dernier est bien ouvert)"
                }
                enqueueSnackbar(Error_Description, { variant: 'error' });
            }
        }
    });
    const login_formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: Yup.object().shape({
            email: Yup.string().email("Please enter a correct email address").required("Please enter a correct email address"),
            password: Yup.string().required("Please enter a password")
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
                    storeAddAccount({ username: responseData.username, email: values.email, password: values.password, current_filter: "undefined", source: "" });
                    enqueueSnackbar("Authentification Reussi, Bienvenue " + responseData.username, { variant: 'success' });
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        switch (error.response.data.code) {
                            case "ACCOUNT_NOT_FOUND":
                                Error_Code = 'ACCOUNT_NOT_FOUND'
                                Error_Description = "Le compte n'a pas été trouvé"
                                Error_Solution = "Veuillez vérifier que l'adresse mail rentrée est correcte"
                                break;
                            case "INCORRECT_PASSWORD":
                                Error_Code = 'INCORRECT_PASSWORD'
                                Error_Description = "Le Mot de Passe est Incorrect"
                                Error_Solution = "Veuillez vérifier que le mot de passe rentré est correct"
                                break;
                            default:
                                Error_Code = 'UNKNOWN_ERROR'
                                Error_Description = "L'Erreur que vous rencontrez est inconnue."
                                Error_Solution = "Veuillez contacter le support de Peerplay"
                                break;
                        }
                    } else if (error.response.status === 400) {
                        Error_Code = 'BAD_REQUEST'
                        Error_Description = "Des éléments requis sont manquants"
                        Error_Solution = "Veuillez vérifier que tous les champs necessaires sont remplis"
                    } else {
                        Error_Code = 'ERROR_500'
                        Error_Description = "Le Serveur de destination a répondu avec une erreur 500."
                        Error_Solution = "Veuillez contactez l'hôte du serveur ou le support de Peerplay (si vous êtes l'hôte)"
                    }
                } else {
                    Error_Code = 'CONNECTION_ERROR'
                    Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                    Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous êtes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application et que celui çi est bien ouvert)"
                }
                enqueueSnackbar(Error_Description, { variant: 'error' });
            }
        },
    });
    const reset_formik = useFormik({
        initialValues: { email: "", reset_credentials: "", method: "reset_key", new_password: "", new_password_confirm: "" },
        validationSchema: Yup.object().shape({
            email: Yup.string().email("Please enter a correct email address").required("Please enter a correct email address"),
            method: Yup.string().required("Please select a method"),
            reset_credentials: Yup.string().required("Please enter the reset key or the original password"),
            new_password: Yup.string().required("Please enter a password"),
            new_password_confirm: Yup.string().test(
                "password_confirm_check",
                "Please enter the same password",
                function (value) {
                    return value === this.parent.new_password || !this.parent.new_password;
                }
            )
        }),
        onSubmit: async (values) => {
            Procedure = 'La Réinitialisation du Mot de Passe'
            const cr_client_data: CRClientData = cr_client_store.get('config')
            const url = `http://${cr_client_data.cr_server_address_api}/auth/reset_password`;
            const params = {
                email: values.email,
                oldPassword: values.method === "password" ? values.reset_credentials : "",
                resetKey: values.method === "reset_key" ? values.reset_credentials : "",
                newPassword: values.new_password,
                confirmNewPassword: values.new_password_confirm
            };
            try {
                const response = await axios.post(url, null, { params: params });
                if (response.status === 200 && response.data.status === 'SUCCESS') {
                    Reset_Key = response.data.account_data.newResetKey
                    try {
                        // Login for update Account Storage
                        const url2 = `http://${cr_client_data.cr_server_address_api}/auth/login`;
                        const params2 = {
                            email: values.email,
                            password: values.new_password
                        };
                        const response2 = await axios.post(url2, null, { params: params2 });
                        if (response2.status === 200) {
                            const responseData2 = response2.data;
                            storeAddAccount({ username: responseData2.username, email: values.email, password: values.new_password, current_filter: 'undefined', source: "" });
                        }
                    } catch (error) { }
                    handleClickResetDialog()
                } else {
                    Error_Code = 'UNEXPECTED_RESPONSE'
                    Error_Description = "La Réponse que vous rencontrez est non prévue"
                    Error_Solution = "Veuillez contacter le support de Peerplay"
                    enqueueSnackbar(Error_Description + "," + Error_Solution, { variant: 'error' });
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        switch (error.response.data.code) {
                            case 'ACCOUNT_NOT_FOUND':
                                Error_Code = 'ACCOUNT_NOT_FOUND'
                                Error_Description = "Le compte n'a pas été trouvé"
                                Error_Solution = "Veuillez verifier si les informations rentrés sont correctes"
                                break;
                            case 'INCORRECT_RESET_CREDENTIALS':
                                Error_Code = 'INCORRECT_RESET_CREDENTIALS'
                                Error_Description = "Les informations demandées sont incorrectes"
                                Error_Solution = "Veuillez verifier si les informations rentrés sont correctes et assurez vous d'avoir selectionné la bonne méthode"
                                break;
                            default:
                                Error_Code = 'UNKNOWN_ERROR'
                                Error_Description = "L'Erreur que vous rencontrez est inconnue"
                                Error_Solution = "Veuillez contacter le support de Peerplay"
                        }
                    } else {
                        if (error.response.status === 400) {
                            Error_Code = 'BAD_REQUEST'
                            Error_Description = "Des elements requis sont manquants"
                            Error_Solution = "Veuillez verifier si les informations rentrés sont correctes"
                        }
                        else {
                            Error_Code = 'ERROR_500'
                            Error_Description = "Le Serveur de destination a repondu avec une erreur 500.",
                                Error_Solution = "Veuillez contactez l'hote du serveur auquel vous tentez de vous connecter ou le support de peerplay (si vous utilisez le serveur integré a l'application)"
                        }
                    }
                } else {
                    Error_Code = 'CONNECTION_ERROR'
                    Error_Description = "La connexion au Serveur Peerplay CR a Échoué."
                    Error_Solution = "Veuillez vérifier votre connexion internet, si elle n'est pas en cause contactez l'hôte du serveur auquel vous etes relié ou le support de Peerplay (si vous utilisez le serveur integré a l'application)"
                }
                enqueueSnackbar(Error_Description, { variant: 'error' });
            }
        }
    });
    let first_call = true
    const [server_opened, setServerOpened] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [networkStatus, setNetworkStatus] = useState({
        network_quality_level: "N/A", // "ANY", "NT1", "NT2", "NT3", NT4, NT5
        connect_method: "N/A", // "ETH" or "WLAN"
    });
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const cr_client_data: CRClientData = cr_client_store.get('config');
            const status_url = `http://${cr_client_data.cr_server_address_api}/network/general/status`;
            try{
                const status_response = await axios.get(status_url);
            if (first_call && status_response.status === 200) {
                setServerOpened(true)
                enqueueSnackbar("Starting Syncronisation with Server, Please Wait", { variant: 'success' });
                first_call = false
                const network_test = await networkTest(false)
                setNetworkStatus({ network_quality_level: network_test.result.network_type, connect_method: network_test.result.connect_type })
                enqueueSnackbar("Syncronisation Finished", { variant: 'success' });
            }
            else
            {
                if (status_response.status === 200){
                    setServerOpened(true)
                    const network_test = await networkTest(false)
                    setNetworkStatus({ network_quality_level: network_test.result.network_type, connect_method: network_test.result.connect_type })
                }
                else {
                    setServerOpened(false)
                    setNetworkStatus({ network_quality_level: "N/A", connect_method: "N/A" })
                }
            }
            const fetchedAccounts = storeGetAccounts();
            fetchedAccounts.forEach(async (current_account: AccountData) => {
                let account = { ...current_account };
                const url = `http://${cr_client_data.cr_server_address_api}/auth/login`;
                const params = {
                    email: account.email,
                    password: account.password
                };
                try {
                    const response = await axios.post(url, null, { params: params });
                    if (response.status === 200) {
                        const token = response.data.jwt;
                        const url1 = `http://${cr_client_data.cr_server_address_api}/account/filter/filter_settings`;
                        const headers = {
                            Authorization: `Bearer ${token}`,
                        };
                        try {
                            const response1 = await axios.get(url1, { headers });
                            if (response1.status === 200) {
                                const responseData = response1.data;
                                if (responseData.actual_filter === "NO_FILTER_FOUND") {
                                    account.source = ""
                                    account.current_filter = "undefined"
                                }
                                else {
                                    account.source = responseData.source;
                                    account.current_filter = `${responseData.actual_filter.network_type}/${responseData.actual_filter.connect_type}/${responseData.actual_filter.password}/${responseData.actual_filter.pool || 'undefined'}`;
                                }
                            }
                        } catch (error) {
                            account.source = ""
                            account.current_filter = "undefined"
                        }
                    }
                } catch (error) {
                    account.current_filter = "undefined"
                }
                storeAddAccount(account)
            });
            setAccounts(storeGetAccounts());
        }
        catch {}
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
    const [openRegisterDialog, setOpenRegisterDialog] = React.useState(false);
    const handleCloseRegisterDialog = () => { Reset_Key = "", setOpenRegisterDialog(false); }
    const handleClickRegisterDialog = () => setOpenRegisterDialog(true);
    const [openResetDialog, setOpenResetDialog] = React.useState(false);
    const handleCloseResetDialog = () => { Reset_Key = "", setOpenResetDialog(false); }
    const handleClickResetDialog = () => setOpenResetDialog(true);

    // Form Dialogs
    const [FilterDialogOpen, setOpenChangeFilterDialog] = useState(false);
    const OpenChangeFilterDialog = (email: string, password: string, username: string) => {
        targetedAccount = { username: username, email: email, password: password };
        setOpenChangeFilterDialog(true);
    };
    const CloseChangeFilterDialog = () => {
        setOpenChangeFilterDialog(false);
    };
    const [activeTab, setActiveTab] = React.useState(0);
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    // Use State
    const [value, setValue] = React.useState(0);
    const [showLoginPassword, setShowLoginPassword] = React.useState(false);
    const handleClickShowLoginPassword = () => setShowLoginPassword((show) => !show);
    const handleMouseDownLoginPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const [showRegisterPassword, setShowRegisterPassword] = React.useState(false);
    const handleClickShowRegisterPassword = () => setShowRegisterPassword((show) => !show);
    const handleMouseDownRegisterPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const [showResetOldPassword, setShowResetOldPassword] = React.useState(false);
    const handleClickShowResetOldPassword = () => setShowResetOldPassword((show) => !show);
    const handleMouseDownResetOldPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const [showResetNewPassword, setShowResetNewPassword] = React.useState(false);
    const handleClickShowResetNewPassword = () => setShowResetNewPassword((show) => !show);
    const handleMouseDownResetNewPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const { enqueueSnackbar } = useSnackbar();
    // @ts-ignore
    return (
        <React.Fragment>
            <Dialog PaperProps={{ style: { minWidth: '800px' } }} open={FilterDialogOpen} onClose={CloseChangeFilterDialog}>
                <DialogTitle>Change Filter Settings</DialogTitle>
                <DialogContentText><center><b>{"Warning, change the filter will cut for a few seconds the consoles connected to peerplay with this account"}</b></center></DialogContentText>
                <DialogContent>
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                        <Tab label="Location based filter" />
                        <Tab label="Password based filter" />
                    </Tabs>

                    {activeTab === 0 && (
                        <GeographicKeyForm handleClose={CloseChangeFilterDialog} />
                    )}

                    {activeTab === 1 && (
                        <PasswordKeyForm handleClose={CloseChangeFilterDialog} />
                    )}
                </DialogContent>
            </Dialog>
            <Dialog PaperProps={{ style: { minWidth: '950px' } }} open={openIPListDialog} onClose={handleCloseIPListDialog}>
                <DialogTitle>Parametrage IP</DialogTitle>
                <DialogContent>
                    <Stack direction="column" spacing={0}>
                        <DialogContentText><b>{"Voici les parametres IP en fonction de la console"}</b></DialogContentText>
                        <DialogContentText><b>{"Ces parametres sont valable pour le compte suivant:"}</b></DialogContentText>
                        <DialogContentText><b>{"Username : " + req_username + " , Email Associé : " + req_email}</b></DialogContentText>
                        <DialogContentText><b>{"ATTENTION, ces parametres ne doivent pas etre partagés entre plusieurs utilisateurs"}</b></DialogContentText>
                        <Stack textAlign="center" direction="column" spacing={0}>
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
            <Dialog maxWidth="md" open={openRegisterDialog} onClose={handleCloseRegisterDialog}>
                <DialogTitle>Inscription Terminé</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"Inscription Terminé avec succés, enregistrement du profil sur l'application"}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Voici des informations importantes concernant votre Compte"}</DialogContentText>
                    <DialogContentText>{"Clé de Réinitialisation : " + Reset_Key}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Veillez a Bien Conserver Cette Clé (Elle vous sera demandé pour réinitialiser ou changer votre mot de passe)"}</DialogContentText>
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
                    <DialogContentText>{"Veillez a Bien Conserver Cette Clé (Elle vous sera demandé pour réinitialiser ou changer votre mot de passe)"}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseResetDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container direction="row">
                <Grid item xs={11} md={6}>
                    <Box py={0} style={{ minHeight: '475px', height: '100%', }}>
                        <Box>
                            <Container>
                                <Typography style={{ textAlign: "center" }} variant="h6" gutterBottom>Liste des
                                    Comptes</Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6.5} md={6.5}>
                                        { server_opened ?                                         <Button variant="contained" endIcon={<NetworkCheck />} onClick={async () => {
                                            enqueueSnackbar("Trying to Regenerate Network Quality", { variant: 'info' })
                                            const network_test = await networkTest(true)
                                            if (network_test.result !== undefined) {
                                                setNetworkStatus({ network_quality_level: network_test.result.network_type, connect_method: network_test.result.connect_type })
                                                enqueueSnackbar(`Network quality successfully regenerated`, { variant: 'success' })
                                            }
                                            else {
                                                enqueueSnackbar(`Unable to regenerate Network Quality : ${network_test.error.split(':')[1] || network_test.error}`, { variant: 'error' })
                                            }
                                        }}>
                                            Test Network
                                        </Button> : <Button variant="contained" endIcon={<NetworkCheck />} disabled>
                                            Test Network
                                        </Button>}
                                    </Grid>
                                    <Grid item xs={2.5} md={2.5}>
                                        <Typography style={{ textAlign: "center" }} gutterBottom>{NetworkQualityRender(networkStatus.network_quality_level)} : {networkStatus.network_quality_level}</Typography>
                                    </Grid>
                                    <Grid item xs={2.5} md={2.5}>
                                        <Typography style={{ textAlign: "center" }} gutterBottom>{ConnectMethodRender(networkStatus.connect_method)} : {networkStatus.connect_method}</Typography>
                                    </Grid>
                                </Grid>
                                {accounts.length !== 0 ? <Carousel
                                    autoPlay={false}
                                    navButtonsAlwaysVisible={true}
                                    fullHeightHover={false}
                                    sx={{ paddingTop: '20px', height: '230px', width: '100%', }}
                                >
                                    {accounts.map((account) => (
                                        <Grid container direction={'column'} alignItems={"center"} justifyContent={"center"} style={{ backgroundColor: '#C0C0C0', borderRadius: '10px' }}>
                                            <Grid container style={{ minHeight: "10px" }}>
                                                <Grid item md={2} style={{ textAlign: "left" }}>
                                                    <IconButton edge="end" disabled>
                                                        <AccountCircle color={account.current_filter !== "undefined" ? "primary" : "inherit"} />
                                                    </IconButton></Grid>
                                                <Grid item md={6}><ListItemText style={{ textAlign: "left" }} primary={account.username} /></Grid>
                                                <Grid item md={4}>
                                                    {
                                                        <Stack direction={"row"}>
                                                            {account.current_filter !== "undefined" && account.source === "LOCAL" ? <>
                                                                {
                                                                    account.current_filter.split("/")[0].toLowerCase() === "ANY".toLowerCase() ? (
                                                                        <IconButton edge="end" onClick={() => handleSwitchNetworkCheckAccount(account.email, account.password, account.username)}>
                                                                            <NetworkCheck color="warning" />
                                                                        </IconButton>
                                                                    ) : (
                                                                        <IconButton edge="end" onClick={() => handleSwitchNetworkCheckAccount(account.email, account.password, account.username)}>
                                                                            <NetworkCheck color="success" />
                                                                        </IconButton>
                                                                    )
                                                                }
                                                            </> : <>
                                                                <IconButton edge="end" disabled>
                                                                    <Block />
                                                                </IconButton>
                                                            </>}
                                                            {
                                                                account.current_filter !== "undefined" ?
                                                                    <>
                                                                        <IconButton edge="end"
                                                                            onClick={() => OpenChangeFilterDialog(account.email, account.password, account.username)}>
                                                                            <KeyIcon />
                                                                        </IconButton>
                                                                    </> : <>
                                                                        <IconButton edge="end" disabled>
                                                                            <Block />
                                                                        </IconButton>
                                                                    </>
                                                            }
                                                            <IconButton edge="end"
                                                                onClick={() => handleGetIPFromAccount(account.email, account.password, account.username)}>
                                                                <PermDeviceInformation />
                                                            </IconButton>
                                                            <IconButton edge="end"
                                                                onClick={() => handleDeleteAccount(account.email)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Stack>
                                                    }
                                                </Grid>
                                            </Grid>
                                            <Grid container style={{ minHeight: "40px" }}>
                                                <Grid item md={2}></Grid>
                                                <Grid item md={8}><ListItemText style={{ textAlign: "left" }} secondary={account.email} /></Grid>
                                                <Grid item md={2}></Grid>
                                            </Grid>
                                            <Grid container style={{ minHeight: "30px" }}>
                                                <Grid item md={2}></Grid>
                                                <Grid item md={9}><ListItemText style={{ textAlign: "left" }} secondary={account.current_filter.split("/")[2]} /></Grid>
                                                <Grid item md={1}></Grid>
                                            </Grid>
                                            <Grid container style={{ minHeight: "35px" }}>
                                                <Grid item md={2}></Grid>
                                                <Grid item md={9}><ListItemText style={{ textAlign: "left" }} secondary={account.current_filter.split("/")[3]} /></Grid>
                                                <Grid item md={1}></Grid>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Carousel> : <Carousel
                                    autoPlay={false}
                                    indicators={false}
                                    navButtonsAlwaysInvisible={true}
                                    fullHeightHover={false}
                                    sx={{ paddingTop: '20px', height: '250px', width: '100%', }}
                                >
                                    <Grid container style={{ backgroundColor: '#C0C0C0', borderRadius: '10px' }}>
                                        <Grid item><Typography style={{ textAlign: "center", height: '110px' }} variant="h6" gutterBottom>{server_opened ? "No Account Found, please add an account or wait for syncronisation" : "Cannot Connect to Server, Please Try later or edit your client configuration"}</Typography></Grid>
                                    </Grid></Carousel>} 
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
                                                <Stack direction="column" spacing={1}>
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
                                                        type={showRegisterPassword ? 'text' : 'password'}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleClickShowRegisterPassword}
                                                                    onMouseDown={handleMouseDownRegisterPassword}
                                                                    edge="end"
                                                                >
                                                                    {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                            ,
                                                        }}
                                                        onChange={register_formik.handleChange}
                                                        value={register_formik.values.password}
                                                        label="Mot de Passe"
                                                    />
                                                    <TextField id="password_confirm"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="password_confirm"
                                                        type="password"
                                                        onChange={register_formik.handleChange}
                                                        value={register_formik.values.password_confirm}
                                                        label="Confirmation Mot de Passe"
                                                    />
                                                    {register_formik.touched.password && register_formik.errors.password ? (
                                                        <div>{register_formik.errors.password}</div>
                                                    ) : null}
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
                                                <Stack direction="column" spacing={1}>
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
                                                        type={showLoginPassword ? 'text' : 'password'}
                                                        onChange={login_formik.handleChange}
                                                        value={login_formik.values.password}
                                                        label="Mot de Passe"
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleClickShowLoginPassword}
                                                                    onMouseDown={handleMouseDownLoginPassword}
                                                                    edge="end"
                                                                >
                                                                    {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                            ,
                                                        }}
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
                                                <Stack direction="column" spacing={1}>
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
                                                    <RadioGroup sx={{ justifyContent: "center" }} row value={reset_formik.values.method} onChange={reset_formik.handleChange} aria-labelledby={reset_formik.values.method} >
                                                        <Stack sx={{ maxHeight: "15px" }} direction="row" spacing={0.5}>
                                                            <FormControlLabel name="method" value="password" control={<Radio />} label="Password" />
                                                            <FormControlLabel name="method" value="reset_key" control={<Radio />} label="Reset Key" />
                                                        </Stack>
                                                    </RadioGroup>
                                                    <TextField id="reset_credentials"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="reset_credentials"
                                                        type={
                                                            reset_formik.values.method === "password"
                                                                ? (showResetOldPassword ? "text" : "password")
                                                                : "text"
                                                        }
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.reset_credentials}
                                                        label={reset_formik.values.method === "password" ? "Mot de Passe" : "Reset Key"}
                                                        InputProps={{
                                                            ...(reset_formik.values.method === "password" && {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleClickShowResetOldPassword}
                                                                            onMouseDown={handleMouseDownResetOldPassword}
                                                                            edge="end"
                                                                        >
                                                                            {showResetOldPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                            }),
                                                        }}
                                                    />
                                                    {reset_formik.touched.reset_credentials && reset_formik.errors.reset_credentials ? (
                                                        <div>{reset_formik.errors.reset_credentials}</div>
                                                    ) : null}
                                                    <TextField id="new_password"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="new_password"
                                                        type={showResetNewPassword ? "text" : "password"}
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.new_password}
                                                        label="Nouveau Mot de Passe"
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleClickShowResetNewPassword}
                                                                    onMouseDown={handleMouseDownResetNewPassword}
                                                                    edge="end"
                                                                >
                                                                    {showResetNewPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                            ,
                                                        }}
                                                    />
                                                    <TextField id="new_password_confirm"
                                                        variant="outlined"
                                                        fullWidth
                                                        name="new_password_confirm"
                                                        type="password"
                                                        onChange={reset_formik.handleChange}
                                                        value={reset_formik.values.new_password_confirm}
                                                        label="Confirmation Nouveau Mot de Passe"
                                                    />
                                                    {reset_formik.touched.new_password && reset_formik.errors.new_password ? (
                                                        <div>{reset_formik.errors.new_password}</div>
                                                    ) : null}
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
        </React.Fragment >
    );
}
