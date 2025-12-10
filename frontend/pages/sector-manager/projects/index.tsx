import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SectorManagerProjects from '@/sector-manager/sector-manager-projects';

function SectorManagerProjectsPage() {
  return (
    <>
      <Head>
        <title>Project Portfolio - Sector Manager</title>
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
            <SectorManagerProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SectorManagerProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="sector-manager">{page}</SidebarLayout>
);

export default SectorManagerProjectsPage;
