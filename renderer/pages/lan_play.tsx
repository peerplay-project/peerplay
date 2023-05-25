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
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { lan_play_start, lan_play_status, lan_play_stop } from '../../resources/peerplay_tools/lan_play/tool';
import { peerplay_cr_client_status } from '../../resources/peerplay_tools/cr_client/tool';

// Définir la forme des données à stocker
interface Data {
    lan_play_server_address: string,
}

export default function Page(props) {
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
        onSubmit: (values) => {
            const data: Data = {
                lan_play_server_address: values.lan_play_server_address,
            }
            store.set('config', data);
            if (peerplay_cr_client_status() === false && lan_play_status() === false) {
                const script = lan_play_start(values.lan_play_server_address)
                if (script === 'SUCCESS') {
                    handleClickStartDialog();
                }
                else {
                    alert(script)
                }
            } else {
                handleClickAlreadyStartedDialog();
            }
        },
    });

    const [openStartDialog, setOpenStartDialog] = React.useState(false);
    const handleCloseStartDialog = () => setOpenStartDialog(false);
    const handleClickStartDialog = () => setOpenStartDialog(true);
    const [openAlreadyStartedDialog, setOpenAlreadyStartedDialog] = React.useState(false);
    const handleCloseAlreadyStartedDialog = () => setOpenAlreadyStartedDialog(false);
    const handleClickAlreadyStartedDialog = () => setOpenAlreadyStartedDialog(true);
    return (
        <React.Fragment>
            <Dialog open={openStartDialog} onClose={handleCloseStartDialog}>
                <DialogTitle>Lan Play démarré avec succés</DialogTitle>
                <DialogContent>
                    <DialogContentText>{"Serveur Lan Play Ciblé : " + formik.values.lan_play_server_address}</DialogContentText>
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
            <Grid container>
                <Grid item xs={12} md={5}>
                    <Box py={9} display="flex" bgcolor="action.selected" style={{ minHeight: '395px', height: '100%' }}>
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
                                            <Button fullWidth variant="contained" color="secondary" onClick={lan_play_stop}>
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
