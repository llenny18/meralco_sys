import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorEscalations from '@/supervisor/supervisor-escalations';

function SupervisorEscalationsPage() {
  return (
    <>
      <Head>
        <title>Escalations - WO Supervisor</title>
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
            <SupervisorEscalations />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorEscalationsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorEscalationsPage;
