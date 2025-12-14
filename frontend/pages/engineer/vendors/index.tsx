import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorVendors from '@/engineer/supervisor-vendors';

function SupervisorVendorsPage() {
  return (
    <>
      <Head>
        <title>Vendors - WO Supervisor</title>
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
            <SupervisorVendors />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorVendorsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorVendorsPage;
