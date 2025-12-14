import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorDelayFactors from '@/engineer/supervisor-delay-factors';

function SupervisorDelayFactorsPage() {
  return (
    <>
      <Head>
        <title>Delay Factors - WO Supervisor</title>
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
            <SupervisorDelayFactors />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorDelayFactorsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorDelayFactorsPage;
