import React from 'react';
import Typography from '@mui/material/Typography';
import {Stack, styled} from '@mui/material';
import { useRouter } from 'next/router'
const Root = styled('div')(({theme}) => {
    return {
        textAlign: 'center',
        paddingTop: theme.spacing(4),
    };
})


function Home() {
    const router = useRouter()

    return (
        <React.Fragment>
            <Stack direction="column" spacing={1}>
                <Typography variant="h4" gutterBottom>
                    Peerplay
                </Typography>
            <Typography variant="subtitle1" gutterBottom>Peerplay est un projet Open Source basé sur Switch Lan Play développé par spacemeowx2, il apporte des modifications pour corriger certains défauts du projet originel, en plus d'autres fonctionnalités</Typography>
            <Typography variant="subtitle1" gutterBottom>Switch Lan Play est un système client - serveur standard (seules les clients connecté au même serveur pouvait communiquer), Peerplay va plus loin en implementant une couche supplémentaire permettant au serveur (qu'il soit stocké localement ou non) de communiquer en Peer to Peer avec les autres serveurs en ligne en plus d'integrer des fonctionnailités optionnel optimisant les connexions pour assurer des performances optimales lors des sessions de jeu</Typography>
            <Typography variant="subtitle1" gutterBottom>À long terme, l'objectif de Peerplay est d'intégrer des fonctionnalités équivalentes à celles des services en ligne officiels (PS+, Nintendo Switch Online, Xbox Live) sans utiliser aucune rétroingénérie (demande d'amis, invitations ...) en plus d'autres fonctionnalités uniques, afin de créer une alternative viable, légale et a l'épreuve du temps</Typography>
            <Typography variant="h6" gutterBottom>Peerplay est un projet en cours de développement, il est donc possible que certaines fonctionnalités ne soient pas encore implémentées ou que des bugs soient présents</Typography>
            </Stack>
            </React.Fragment>

    );
};

export default Home;
