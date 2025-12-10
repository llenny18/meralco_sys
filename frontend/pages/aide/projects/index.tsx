import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AideProjects from '@/aide/aide-projects';

function AideProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects - Engineering Aide</title>
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
            <AideProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AideProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="aide">{page}</SidebarLayout>
);

export default AideProjectsPage;
