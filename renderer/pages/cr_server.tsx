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
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { peerplay_cr_server_status, peerplay_cr_server_start, peerplay_cr_server_stop } from '../../resources/peerplay_tools/cr_server/tool';
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
interface Data {
    uuid: string,
    minimal_port_range: number,
    domain_name: string,
    open_external_udp_server: boolean,
    cr_server_external_port: number
}
export default function Page(props) {
    const content = {
        'header': 'Peerplay Console Relay Server',
        'description1': "Peerplay CR Server est un fork du serveur Lan Play (Codé en NodeJS),Les modifications apporté permettent au Serveurs d'intercommuniquer entre eux",
        'warning1': "Attention, si aucun nom de domaine n'est donné votre addresse ip public sera partagé via la base de données",
        'warning2': "Nous Recommandons l'utilisation d'un nom de domaine pour utiliser Cette Fonctionnalité (Avec NO-IP ou DynDNS Par Exemple)",
        'primary-action': 'Start Service',
        'secondary-action': 'Stop Service',
        'other-action': 'Get the list of ports to open',
        ...props.content
    };
    const valeursParDefaut: Data = {
        uuid: uuidv5(uuidv4(), uuidv4()),
        minimal_port_range: 0,
        domain_name: "",
        open_external_udp_server: false,
        cr_server_external_port: 0
    };
    const store = new Store<Data>({
        name: 'cr_server-config',
    });
    const save_data: Data = store.get('config');
    // Initialiser les valeurs par défaut
    const sauvegarde = {
        ...valeursParDefaut,
        ...save_data,
    };
    const { enqueueSnackbar } = useSnackbar();
    const formik = useFormik({
        initialValues: sauvegarde,
        validationSchema: Yup.object().shape({
            open_external_udp_server: Yup.boolean().test(
                'local_server_check',
                'Veuillez selectionner un port a utiliser',
                function (value) {
                    if (this.parent.cr_server_external_port === 0 && value === true) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            ),
        }),
        onSubmit: async (values) => {
            const data: Data = {
                uuid: sauvegarde.uuid,
                minimal_port_range: values.minimal_port_range,
                domain_name: values.domain_name,
                open_external_udp_server: values.open_external_udp_server,
                cr_server_external_port: values.cr_server_external_port
            }
            store.set('config', data);
            let startStatus = await peerplay_cr_server_status(false);
            if (startStatus.started === false) {
                const start_process = await peerplay_cr_server_start(data.uuid, values.minimal_port_range, values.domain_name, values.open_external_udp_server, values.cr_server_external_port);
                if (start_process === "SUCCESS") {
                    enqueueSnackbar('Peerplay CR Serveur en cours de démarrage', { variant: 'info' });
                    while (startStatus.running === false) {
                        startStatus = await peerplay_cr_server_status(false);
                        if (startStatus.started === false) {
                            enqueueSnackbar('Impossible de Démarrer Peerplay CR Server', { variant: 'error' })
                            break; // Ajoutez cette ligne si vous souhaitez sortir de la boucle après avoir affiché l'erreur
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendez 1 seconde avant de continuer la boucle
                    }
                    if (startStatus.running === true && startStatus.started === true) {
                        enqueueSnackbar('Peerplay CR Server a été demarré avec succés', { variant: 'success' })
                    }
                } else {
                    enqueueSnackbar('Impossible de Démarrer Peerplay CR Server', { variant: 'error' })
                }
            } else {
                if (startStatus.running === true) {
                    enqueueSnackbar('Peerplay CR Server est deja démarré', { variant: 'warning' })
                } else {
                    enqueueSnackbar('Peerplay CR Server est en cours de démarrage', { variant: 'warning' })
                }
            }
        },
    });
    const [openGetPortsDialog, setOpenGetPortsDialog] = React.useState(false);
    const handleCloseGetPortsDialog = () => setOpenGetPortsDialog(false);
    const handleClickGetPortsDialog = () => setOpenGetPortsDialog(true);
    return (
        <React.Fragment>
            <Dialog maxWidth="md" open={openGetPortsDialog} onClose={handleCloseGetPortsDialog}>
                <DialogTitle>Liste des Ports a Ouvrir pour utiliser Peerplay CR Server</DialogTitle>
                <DialogContent>
                    <DialogContentText>Selon votre configuration, Peerplay CR Serveur a besoin que les ports suivants soit ouvert sur votre Box</DialogContentText>
                </DialogContent>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 'bold' }}>Communication P2P (TCP ET UDP): Privé:5982 / Public:{5982 + sauvegarde.minimal_port_range}</DialogContentText>
                    <DialogContentText>Permet de transferer les données LAN (Généré par votre console) sur le Réseau P2P Peerplay</DialogContentText>
                    <Divider />
                    <DialogContentText sx={{ fontWeight: 'bold' }}>Base de Données P2P (TCP): Privé:5983 / Public:{5983 + sauvegarde.minimal_port_range}</DialogContentText>
                    <DialogContentText>Permet de synchroniser les données necessaire a la communication P2P en temps réel</DialogContentText>
                    <Divider />
                    {sauvegarde.domain_name !== "" ? <DialogContentText sx={{ fontWeight: 'bold' }}>Nom de Domaine Actif et Redirigeant vers votre ordinateur: {sauvegarde.domain_name}</DialogContentText> : <DialogContentText></DialogContentText>}
                    {sauvegarde.domain_name !== "" ? <DialogContentText>Permet de remplacer votre Adresse IP Public par une Adresse Lisible</DialogContentText> : <DialogContentText></DialogContentText>}
                    {sauvegarde.domain_name !== "" ? <Divider /> : <DialogContentText></DialogContentText>}
                    {sauvegarde.open_external_udp_server === true ? <DialogContentText sx={{ fontWeight: 'bold' }}>{`Serveur API Public (TCP): Privé:5985 / Public:${5985 + sauvegarde.minimal_port_range}`}</DialogContentText> : <DialogContentText></DialogContentText>}
                    {sauvegarde.open_external_udp_server === true ? <DialogContentText sx={{ fontWeight: 'bold' }}>{`Serveur UDP Externe (TCP ET UDP): Privé: ${sauvegarde.cr_server_external_port} / Public:${sauvegarde.cr_server_external_port + sauvegarde.minimal_port_range}`}</DialogContentText> : <DialogContentText></DialogContentText>}
                    {sauvegarde.open_external_udp_server === true ? <DialogContentText>Optionnel : Permet d'autoriser aux clients ne pouvant pas communiquer en P2P d'utiliser votre serveur comme relais</DialogContentText> : <DialogContentText></DialogContentText>}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={handleCloseGetPortsDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container>
                <Grid item xs={13} md={5}>
                    <Box py={3} display="flex" style={{ minHeight: '620px', height: '100%' }}>
                        <Box>
                            <Container>
                                <Typography variant="h5" component="h5" gutterBottom={true}>{content['header']}</Typography>
                                <Typography variant="subtitle1" color="textSecondary" paragraph={true}>{content['description1']}</Typography>
                                <Typography variant="subtitle2" color="textSecondary" paragraph={true}>{content['warning1']}</Typography>
                                <Typography variant="subtitle2" color="textSecondary" paragraph={true}>{content['warning2']}</Typography>
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
                                        <Box>
                                            <TextField id="minimal_port_range"
                                                variant="outlined"
                                                fullWidth
                                                name="minimal_port_range"
                                                type="number"
                                                onChange={formik.handleChange}
                                                value={formik.values.minimal_port_range}
                                                label="Port Minimal Ouvrable"
                                                helperText="Cette valeur se trouve dans les parametres de votre box internet (IPV4)"
                                            />
                                            <TextField id="domain_name"
                                                variant="outlined"
                                                fullWidth
                                                name="domain_name"
                                                type="text"
                                                onChange={formik.handleChange}
                                                value={formik.values.domain_name}
                                                label="Nom de Domaine"
                                                helperText="Partager un nom de domaine a la place de votre adresse ip public (Recommandé)"
                                            />
                                        </Box>
                                        <Box py={1}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formik.values.open_external_udp_server}
                                                        onChange={formik.handleChange}
                                                        name="open_external_udp_server"
                                                        color="primary"
                                                    />
                                                }
                                                label="Ouvrir le Serveur UDP 'EXTERNE' ?"
                                            />
                                            <TextField id="cr_server_external_port"
                                                variant="outlined"
                                                fullWidth
                                                name="cr_server_external_port"
                                                type="number"
                                                onChange={formik.handleChange}
                                                value={formik.values.cr_server_external_port}
                                                label="Port a Utiliser" />
                                            {formik.touched.open_external_udp_server && formik.errors.open_external_udp_server ? (
                                                <div>{formik.errors.open_external_udp_server}</div>
                                            ) : null}
                                        </Box>
                                        <Stack direction="column" spacing={1}>
                                            <Stack direction="row" spacing={1}>
                                                <Button type="submit" fullWidth variant="contained" color="primary">
                                                    {content['primary-action']}
                                                </Button>
                                                <Button fullWidth variant="contained" color="error" onClick={async () => {
                                                    if ((await peerplay_cr_server_status(false)).started === true) {
                                                        if ((await (await peerplay_cr_server_status(false)).running === true)) {
                                                            peerplay_cr_server_stop();
                                                            enqueueSnackbar('Peerplay CR Server a été arrété avec succés', { variant: 'success' })
                                                        }
                                                        else {
                                                            enqueueSnackbar('Impossible de fermer Peerplay CR Server si il est en cours de demarrage', { variant: 'error' })
                                                        }
                                                    }
                                                    else {
                                                        enqueueSnackbar('Peerplay CR Server est déja arrété', { variant: 'warning' })
                                                    }
                                                }}>
                                                    {content['secondary-action']}
                                                </Button>
                                            </Stack>
                                            <Button fullWidth variant="contained" style={{ backgroundColor: '#757575' }} onClick={handleClickGetPortsDialog}>
                                                {content['other-action']}
                                            </Button>
                                        </Stack>
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
