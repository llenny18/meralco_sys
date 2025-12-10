import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SectorManagerSla from '@/sector-manager/sector-manager-sla';

function SectorManagerSlaPage() {
  return (
    <>
      <Head>
        <title>SLA Compliance - Sector Manager</title>
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
            <SectorManagerSla />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SectorManagerSlaPage.getLayout = (page) => (
  <SidebarLayout userRole="sector-manager">{page}</SidebarLayout>
);

export default SectorManagerSlaPage;
