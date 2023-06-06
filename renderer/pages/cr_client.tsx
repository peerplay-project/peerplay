import React from 'react';
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
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Stack
} from '@mui/material';
import { peerplay_cr_client_start, peerplay_cr_client_status, peerplay_cr_client_stop } from '../../resources/peerplay_tools/cr_client/tool';
import {peerplay_cr_server_status } from '../../resources/peerplay_tools/cr_server/tool';
import { lan_play_status } from '../../resources/peerplay_tools/lan_play/tool';
import Divider from "@mui/material/Divider";

// Définir la forme des données à stocker
interface Data {
    cr_server_address: string,
    cr_server_address_api: string,
    use_localhost_cr_server: boolean,
}

export default function Page(props) {
    const content = {
        'header': 'Peerplay Console Relay Client',
        'description1': "Peerplay CR Client est un script de demarrage spécial pour Lan Play",
        'description2': "Conçue pour lancer plusieurs instances de Lan Play avec une configuration PCAP differente",
        'primary-action': 'Start Service',
        'secondary-action': 'Stop Service',
        ...props.content
    };
    const valeursParDefaut: Data = {
        cr_server_address: '',
        cr_server_address_api: '',
        use_localhost_cr_server: false,
    };
    const store = new Store<Data>({
        name: 'cr_client-config',
    });
    const save_data: Data = store.get('config');
    // Initialiser les valeurs par défaut
    const sauvegarde = {
        ...valeursParDefaut,
        ...save_data,
    };
    const formik = useFormik({
        initialValues: sauvegarde,
        validationSchema: Yup.object().shape({
          cr_server_address_api: Yup.string().test(
            "is-server-address-required",
            "Please enter a CR server address",
            function (value) {
              if (this.parent.use_localhost_cr_server === false) {
                return value && value.trim().length > 0;
              }
              return true;
            }
          ),
          use_localhost_cr_server: Yup.boolean().test(
            'local_server_check',
            'Cannot use Localhost CR_SERVER if Not Opened',
            async function (value) {
              if (value) {
                return await (await peerplay_cr_server_status(false)).started !== false;
              } else {
                if (
                  await (await peerplay_cr_server_status(false)).started === false &&
                  this.parent.cr_server_address === 'localhost:5981'
                ) {
                  return false;
                }
              }
              return true;
            }
          ),
        }),
        onSubmit: async (values) => {
          values.cr_server_address = '';
          let url = `http://${values.cr_server_address_api}/network/general/status`;
          let serverAddress = '';
      
          try {
            if (values.use_localhost_cr_server && (await peerplay_cr_server_status(false)).running === true) {
              values.cr_server_address_api = "localhost:5985";
              const response = await axios.get(url);
              if (response.status === 200) {
                serverAddress = "localhost:5981";
              } else {
                console.log(response);
              }
            } else {
              const response = await axios.get(url);
              if (response.status === 200) {
                const responseData = response.data;
                if (responseData.external_ip !== 'DISABLED') {
                  serverAddress = responseData.external_ip;
                }
              } else {
                handleClickCannotConnectDialog();
              }
            }
          } catch (error) {
            console.log(error);
            handleClickCannotConnectDialog();
          }
      
          const data = {
            cr_server_address: serverAddress,
            cr_server_address_api: values.cr_server_address_api,
            use_localhost_cr_server: values.use_localhost_cr_server,
          };
          store.set('config', data);
      
          if (serverAddress !== '') {
            if (peerplay_cr_client_status() === false && lan_play_status() === false) {
              const script = peerplay_cr_client_start(serverAddress);
              if (script === 'SUCCESS') {
                handleClickStartDialog();
              }
            } else {
              handleClickAlreadyStartedDialog();
            }
          }
        },
      });

    const [openStartDialog, setOpenStartDialog] = React.useState(false);
    const handleCloseStartDialog = () => setOpenStartDialog(false);
    const handleClickStartDialog = () => setOpenStartDialog(true);
    const [openAlreadyStartedDialog, setOpenAlreadyStartedDialog] = React.useState(false);
    const handleCloseAlreadyStartedDialog = () => setOpenAlreadyStartedDialog(false);
    const handleClickAlreadyStartedDialog = () => setOpenAlreadyStartedDialog(true);
    const [openCannotConnectDialog, setOpenCannotConnectDialog] = React.useState(false);
    const handleCloseCannotConnectDialog = () => setOpenCannotConnectDialog(false);
    const handleClickCannotConnectDialog = () => setOpenCannotConnectDialog(true);
    return (
        <React.Fragment>
            <Dialog open={openStartDialog} onClose={handleCloseStartDialog}>
                <DialogTitle>Peerplay CR Client démarré avec succés</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"Peerplay CR Server Address: " + formik.values.cr_server_address}</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText>{"Use Peerplay Local CR Server: " + formik.values.use_localhost_cr_server.toString()}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseStartDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openAlreadyStartedDialog} onClose={handleCloseAlreadyStartedDialog}>
                <DialogTitle>Peerplay CR Client ou Lan Play est deja lancé</DialogTitle>
                <DialogContent>
                    <DialogContentText>Peerplay CR Client ou Lan Play est deja lancé, impossible d'ouvrir une deuxieme instance</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseAlreadyStartedDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openCannotConnectDialog} onClose={handleCloseCannotConnectDialog}>
                <DialogTitle>Connexion Impossible</DialogTitle>
                <DialogContent>
                    <DialogContentText>Impossible de se connecter au serveur</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseCannotConnectDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container>
                <Grid item xs={11} md={5}>
                    <Box py={5} display="flex" bgcolor="action.selected" style={{ minHeight: '620px', height: '100%' }}>
                        <Box>
                            <Container>
                                <Typography variant="h5" component="h5" gutterBottom={true}>{content['header']}</Typography>
                                <Typography variant="subtitle1" color="textSecondary" paragraph={true}>{content['description1']}</Typography>
                                <Typography variant="subtitle1" color="textSecondary" paragraph={true}>{content['description2']}</Typography>
                            </Container>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Box py={4} display="flex">
                        <Container>
                            <form noValidate onSubmit={formik.handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField id="cr_server_address_api"
                                            variant="outlined"
                                            fullWidth
                                            name="cr_server_address_api"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.cr_server_address_api}
                                            label="Adresse API du Serveur Peerplay CR"
                                            helperText="Addresse IP ou Nom de Domaine du Serveur Peerplay CR Cible"
                                        />
                                        {formik.touched.cr_server_address_api && formik.errors.cr_server_address_api ? (
                                            <div>{formik.errors.cr_server_address_api}</div>
                                        ) : null}
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formik.values.use_localhost_cr_server}
                                                    onChange={formik.handleChange}
                                                    name="use_localhost_cr_server"
                                                    color="primary"
                                                />
                                            }
                                            label="Utiliser le Serveur Peerplay CR integré a l'application"

                                        />
                                        {formik.touched.use_localhost_cr_server && formik.errors.use_localhost_cr_server ? (
                                            <div>{formik.errors.use_localhost_cr_server}</div>
                                        ) : null}
                                        <Box mt={2}>
                                            <Stack direction="row" spacing={1}>
                                                <Button type="submit" fullWidth variant="contained" color="primary">
                                                    {content['primary-action']}
                                                </Button>
                                                <Button fullWidth variant="contained" color="error" onClick={peerplay_cr_client_stop}>
                                                    {content['secondary-action']}
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                            <Divider />

                        </Container>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}
