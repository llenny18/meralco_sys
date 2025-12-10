import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SectorManagerPenalties from '@/sector-manager/sector-manager-penalties';

function SectorManagerPenaltiesPage() {
  return (
    <>
      <Head>
        <title>Penalties Overview - Sector Manager</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <SectorManagerPenalties />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SectorManagerPenaltiesPage.getLayout = (page) => (
  <SidebarLayout userRole="sector-manager">{page}</SidebarLayout>
);

export default SectorManagerPenaltiesPage;
