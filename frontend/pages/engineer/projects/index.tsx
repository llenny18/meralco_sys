import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerProjects from '@/engineer/engineer-projects';

function EngineerProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects - Engineer Portal</title>
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
            <EngineerProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerProjectsPage;
