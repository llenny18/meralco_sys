import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorProjectDelays from '@/supervisor/supervisor-project-delays';

function SupervisorProjectDelaysPage() {
  return (
    <>
      <Head>
        <title>Project Delays - WO Supervisor</title>
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
            <SupervisorProjectDelays />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorProjectDelaysPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorProjectDelaysPage;
