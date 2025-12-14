import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerSlaTracking from '@/engineer/old/engineer-sla-tracking';

function EngineerSlaTrackingPage() {
  return (
    <>
      <Head>
        <title>SLA Tracking - Engineer Portal</title>
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
            <EngineerSlaTracking />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerSlaTrackingPage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerSlaTrackingPage;
