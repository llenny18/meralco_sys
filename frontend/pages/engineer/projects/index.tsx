import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorProjects from '@/engineer/supervisor-projects';

function SupervisorProjectsPage() {
  return (
    <>
      <Head>
        <title>All Projects - WO Supervisor</title>
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
            <SupervisorProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorProjectsPage;
