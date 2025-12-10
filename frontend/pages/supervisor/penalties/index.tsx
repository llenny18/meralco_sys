import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorPenalties from '@/supervisor/supervisor-penalties';

function SupervisorPenaltiesPage() {
  return (
    <>
      <Head>
        <title>Penalties - WO Supervisor</title>
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
            <SupervisorPenalties />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorPenaltiesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorPenaltiesPage;
