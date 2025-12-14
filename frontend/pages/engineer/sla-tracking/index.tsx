import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorSlaTracking from '@/engineer/supervisor-sla-tracking';

function SupervisorSlaTrackingPage() {
  return (
    <>
      <Head>
        <title>SLA Tracking - WO Supervisor</title>
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
            <SupervisorSlaTracking />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorSlaTrackingPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorSlaTrackingPage;
