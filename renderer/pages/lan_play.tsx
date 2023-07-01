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
import { lan_play_start, lan_play_status, lan_play_stop } from '../../resources/peerplay_tools/lan_play/tool';
import { peerplay_cr_client_status } from '../../resources/peerplay_tools/cr_client/tool';
import axios from 'axios';
import { useSnackbar } from 'notistack';

// Définir la forme des données à stocker
interface Data {
    lan_play_server_address: string,
}

export default function Page(props) {
    const { enqueueSnackbar } = useSnackbar();
    const content = {
        'header': 'Client Lan Play',
        'description1': "Lan Play est un programme conçu par spacemeowx2, utilisé et integré par Peerplay",
        'description2': "Peerplay est retrocompatible avec Lan Play",
        'primary-action': 'Start Service',
        'secondary-action': 'Stop Service',
        ...props.content
    };
    const valeursParDefaut: Data = {
        lan_play_server_address: '',
    };
    const store = new Store<Data>({
        name: 'lan_play-config',
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
            lan_play_server_address: Yup.string().required("Please enter a Lan Play Server address"),
        }),
        onSubmit: async (values) => {
            let url = `http://${values.lan_play_server_address}/info`;
            try {
                const response = await axios.get(url);
                if (response.status === 200) {
                    const responseData = response.data;
                    if (typeof responseData.online === 'number') {
                        const data: Data = {
                            lan_play_server_address: values.lan_play_server_address,
                        }
                        store.set('config', data);
                        if (peerplay_cr_client_status() === false && lan_play_status() === false) {
                            const script = lan_play_start(values.lan_play_server_address)
                            if (script === 'SUCCESS') {
                                enqueueSnackbar('Lanplay lancé avec succés', { variant: 'success' })
                            }
                        } else {
                            enqueueSnackbar('Lan Play ou Peerplay CR Client est déja lancé', { variant: 'warning' })
                        }
                    }
                } else {
                    enqueueSnackbar('Impossible de se connecter au serveur cible', { variant: 'error' })
                }
            } catch (error) {
                console.log(error);
                enqueueSnackbar('Impossible de se connecter au serveur cible', { variant: 'error' })
            }
        },
    });
    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12} md={5}>
                    <Box py={9} display="flex" style={{ minHeight: '620px', height: '100%' }}>
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
                    <Box py={12} display="flex">
                        <Container>
                            <form noValidate onSubmit={formik.handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField id="lan_play_server_address"
                                            variant="outlined"
                                            fullWidth
                                            name="lan_play_server_address"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.lan_play_server_address}
                                            label="Adresse du Serveur Peerplay CR"
                                            helperText="Addresse IP ou Nom de Domaine du Serveur Peerplay CR Cible"
                                        />
                                        {formik.touched.lan_play_server_address && formik.errors.lan_play_server_address ? (
                                            <div>{formik.errors.lan_play_server_address}</div>
                                        ) : null}
                                        <Box mt={2}>
                                            <Button type="submit" fullWidth variant="contained" color="primary">
                                                {content['primary-action']}
                                            </Button>
                                            <Button fullWidth variant="contained" color="secondary" onClick={() => {
                                                if (lan_play_status() === true){
                                                    lan_play_stop()
                                                    enqueueSnackbar('Lan Play a été arrété avec succés', { variant: 'success' })
                                                }
                                                else
                                                {
                                                    enqueueSnackbar('Lan Play est déja arrété', { variant: 'warning' })
                                                }
                                                }}>
                                                {content['secondary-action']}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </Container>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}
