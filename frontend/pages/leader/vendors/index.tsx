import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderVendors from '@/leader/leader-vendors';

function LeaderVendorsPage() {
  return (
    <>
      <Head>
        <title>Vendor Management - Team Leader</title>
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
            <LeaderVendors />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderVendorsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderVendorsPage;
