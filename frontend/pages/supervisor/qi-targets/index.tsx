import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorQiTargets from '@/supervisor/supervisor-qi-targets';

function SupervisorQiTargetsPage() {
  return (
    <>
      <Head>
        <title>QI Daily Targets - WO Supervisor</title>
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
            <SupervisorQiTargets />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorQiTargetsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorQiTargetsPage;
