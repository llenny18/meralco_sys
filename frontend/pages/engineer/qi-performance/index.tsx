import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorQiPerformance from '@/engineer/supervisor-qi-performance';

function SupervisorQiPerformancePage() {
  return (
    <>
      <Head>
        <title>QI Performance - WO Supervisor</title>
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
            <SupervisorQiPerformance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorQiPerformancePage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorQiPerformancePage;
